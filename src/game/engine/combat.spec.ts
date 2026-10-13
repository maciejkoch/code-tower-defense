import { BASELINE_CONFIG } from '../balance/profiles';
import { describe, expect, it } from 'vitest';
import { buildTower, spawnMob, upgradeTower } from './actions';
import { resolveCombat, selectTarget } from './combat';
import { createMatch } from './create-match';
import type { MatchState, MobState } from './model';
import { stepMatch } from './step';

function fixture(type: 'basic' | 'splash' = 'basic'): MatchState {
  const built = buildTower(createMatch(BASELINE_CONFIG), 1, type, 4, 6).state;
  return { ...spawnMob(built, 2, 'basic').state, status: 'running' };
}
function withMobs(state: MatchState, patches: readonly Partial<MobState>[]): MatchState {
  const base = state.players[0].mobs[0];
  const mobs = patches.map((patch, index) => ({
    ...base,
    id: 100 + index,
    hp: 100,
    maxHp: 100,
    x: 5,
    y: 6,
    remainingDistance: 10,
    from: { x: patch.x ?? 5, y: patch.y ?? 6 },
    to: { x: patch.x ?? 5, y: patch.y ?? 6 },
    ...patch,
  }));
  return { ...state, players: [{ ...state.players[0], mobs }, state.players[1]] };
}

describe('combat', () => {
  it('uses remaining path distance and ID for target priority, independently of array order', () => {
    const state = withMobs(fixture(), [
      { id: 9, remainingDistance: 3 },
      { id: 4, remainingDistance: 3 },
      { id: 1, remainingDistance: 5 },
    ]);
    expect(selectTarget(state.players[0].towers[0], state.players[0].mobs)?.id).toBe(4);
    expect(selectTarget(state.players[0].towers[0], [...state.players[0].mobs].reverse())?.id).toBe(
      4,
    );
    const shortest = withMobs(state, [
      { id: 9, remainingDistance: 1 },
      { id: 4, remainingDistance: 3 },
    ]);
    expect(selectTarget(shortest.players[0].towers[0], shortest.players[0].mobs)?.id).toBe(9);
  });

  it('uses Euclidean range, including its boundary, without line-of-sight blocking', () => {
    const state = withMobs(fixture(), [{ x: 6.5, y: 8.5 }]);
    expect(selectTarget(state.players[0].towers[0], state.players[0].mobs)).toBeNull();
    const diagonal = withMobs(state, [{ x: 6, y: 8 }]);
    expect(selectTarget(diagonal.players[0].towers[0], diagonal.players[0].mobs)).not.toBeNull();
    const behindWall = withMobs(buildTower(fixture(), 1, 'basic', 5, 6).state, [{ x: 7, y: 6 }]);
    const result = resolveCombat(behindWall, 0);
    expect(
      result.attacks.some((attack) => attack.towerId === 1 && attack.targetMobId === 100),
    ).toBe(true);
  });

  it('hits all mobs in splash radius, even beyond tower range, with the main target once', () => {
    const state = withMobs(fixture('splash'), [
      { x: 7, y: 6 },
      { x: 8, y: 6 },
      { x: 8.5, y: 6 },
      { x: 8.6, y: 6 },
    ]);
    const result = resolveCombat(state, 0);
    expect(result.players[0].mobs.map((mob) => mob.hp)).toEqual([92, 92, 92, 100]);
    expect(result.attacks).toHaveLength(1);
    expect(result.attacks[0].splashRadius).toBe(1.5);
    expect(state.players[0].mobs[0].hp).toBe(100);
  });

  it('selects all targets before damage, sums hits and pays a killed mob only once', () => {
    const state = withMobs(buildTower(fixture(), 1, 'basic', 4, 7).state, [
      { id: 100, hp: 15, remainingDistance: 1 },
      { id: 101, hp: 100, remainingDistance: 2 },
    ]);
    const result = resolveCombat(state, 0);
    expect(result.attacks.map((attack) => attack.targetMobId)).toEqual([100, 100]);
    expect(result.players[0].mobs.map((mob) => mob.id)).toEqual([101]);
    expect(result.players[0].mobs[0].hp).toBe(100);
    expect(result.players[0].gold).toBe(state.players[0].gold + 5);
    expect(result.players[0].logs).toHaveLength(1);
    const reversed = {
      ...state,
      players: [
        { ...state.players[0], towers: [...state.players[0].towers].reverse() },
        state.players[1],
      ] as const,
    };
    const again = resolveCombat(reversed, 0);
    expect(again.players[0].mobs).toEqual(result.players[0].mobs);
    expect(again.players[0].gold).toBe(result.players[0].gold);
  });

  it('caps a splash at six including the main target, then nearest mobs with ID ties', () => {
    const config = {
      ...BASELINE_CONFIG,
      towers: {
        ...BASELINE_CONFIG.towers,
        splash: { ...BASELINE_CONFIG.towers.splash, maxTargets: 6 },
      },
    };
    const state = withMobs({ ...fixture('splash'), config }, [
      { id: 100, remainingDistance: 1 },
      { id: 9, x: 5 },
      { id: 8, x: 5.2 },
      { id: 7, x: 5.4 },
      { id: 6, x: 5.6 },
      { id: 5, x: 6 },
      { id: 4, x: 6 },
      { id: 3, x: 6 },
      { id: 2, x: 6.5 },
      { id: 1, x: 6.6 },
    ]);
    const result = resolveCombat(state, 0);
    const hits = result.players[0].mobs
      .filter((mob) => mob.hp === 92)
      .map((mob) => mob.id)
      .sort((a, b) => a - b);
    expect(hits).toEqual([3, 6, 7, 8, 9, 100]);
    const reversed = {
      ...state,
      players: [
        { ...state.players[0], mobs: [...state.players[0].mobs].reverse() },
        state.players[1],
      ] as const,
    };
    const again = resolveCombat(reversed, 0);
    expect(
      again.players[0].mobs
        .filter((mob) => mob.hp === 92)
        .map((mob) => mob.id)
        .sort((a, b) => a - b),
    ).toEqual(hits);
  });

  it('uses the same capped victims for simultaneous explosions and rewards each kill once', () => {
    let state = buildTower(fixture('splash'), 1, 'splash', 4, 7).state;
    state = {
      ...state,
      config: {
        ...state.config,
        towers: {
          ...state.config.towers,
          splash: { ...state.config.towers.splash, maxTargets: 6 },
        },
      },
    };
    state = withMobs(
      state,
      Array.from({ length: 8 }, (_, i) => ({ id: 100 + i, hp: 10 })),
    );
    const result = resolveCombat(state, 0);
    expect(result.attacks.map((attack) => attack.targetMobId)).toEqual([100, 100]);
    expect(result.players[0].mobs.map((mob) => [mob.id, mob.hp])).toEqual([
      [106, 10],
      [107, 10],
    ]);
    expect(result.players[0].gold - state.players[0].gold).toBe(6 * 5);
    expect(result.players[0].logs).toHaveLength(6);
  });

  it('keeps a ready tower ready without a target and shoots immediately when one appears', () => {
    const state = withMobs(fixture(), [{ x: 15, y: 6 }]);
    const idle = resolveCombat(state, 2);
    expect(idle.attacks).toEqual([]);
    expect(idle.players[0].towers[0].cooldownRemaining).toBe(0);
    const fired = resolveCombat(withMobs(idle, [{ x: 4, y: 5 }]), 0);
    expect(fired.attacks).toHaveLength(1);
    expect(fired.players[0].mobs[0].hp).toBe(90);
  });

  it('fires at 0, 0.5 and 1 seconds and preserves the cooldown during upgrade', () => {
    let state = resolveCombat(withMobs(fixture(), [{ hp: 1000, maxHp: 1000 }]), 0);
    let shots = state.attacks.length;
    const upgraded = upgradeTower(state, 1, state.players[0].towers[0].id).state;
    expect(upgraded.players[0].towers[0].cooldownRemaining).toBe(0.5);
    state = upgraded;
    for (let i = 1; i <= 10; i++) {
      state = resolveCombat({ ...state, tick: i }, 0.1);
      shots += state.attacks.length;
      if (i < 5) expect(state.attacks).toEqual([]);
    }
    expect(shots).toBe(3);
    expect(state.players[0].mobs[0].hp).toBe(960); // 10, then 15 twice.
  });

  it('allows a tower built in this tick to damage a newly produced mob before movement', () => {
    const built = buildTower(createMatch(BASELINE_CONFIG), 1, 'basic', 3, 6).state;
    const state = { ...spawnMob(built, 2, 'basic').state, status: 'running' as const };
    const prepared = resolveCombat(state, 0);
    expect(prepared.tick).toBe(0);
    expect(prepared.players[0].mobs[0]).toMatchObject({ x: 0, y: 6, hp: 30 });
    expect(prepared.attacks).toHaveLength(1);
  });

  it('removes lethal hits before movement, so a killed mob cannot leak or earn a second reward', () => {
    const built = buildTower(createMatch(BASELINE_CONFIG), 1, 'basic', 13, 5).state;
    const state = withMobs({ ...spawnMob(built, 2, 'basic').state, status: 'running' }, [
      {
        hp: 10,
        x: 14.9,
        y: 6,
        from: { x: 14, y: 6 },
        to: { x: 15, y: 6 },
        progress: 0.9,
        remainingDistance: 0.1,
      },
    ]);
    const prepared = resolveCombat(state, 0);
    expect(prepared.players[0].mobs).toEqual([]);
    const next = stepMatch(prepared);
    expect(next.players[0].leaks).toBe(0);
    expect(next.players[0].gold).toBe(state.players[0].gold + 5 + 1); // Kill reward and next tick's income.
    expect(next.players[0].logs).toHaveLength(1);
  });

  it('does not change combat or cooldowns while paused', () => {
    const paused = { ...fixture(), status: 'paused' as const };
    expect(resolveCombat(paused, 10)).toBe(paused);
  });
});
