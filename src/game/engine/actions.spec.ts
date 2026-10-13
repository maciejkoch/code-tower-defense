import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/game-config';
import { buildTower, sellTower, spawnMob } from './actions';
import { createMatch } from './create-match';
import { addIncome } from './economy';
import type { MatchState } from './model';
import { stepMatch } from './step';
import { createDistanceField, distanceAt } from './pathfinding';

function withGold(gold: number): MatchState {
  const config = structuredClone(GAME_CONFIG);
  config.economy.startingGold = gold;
  return createMatch(config);
}

function runningMob(): MatchState {
  let state: MatchState = { ...spawnMob(createMatch(), 2, 'basic').state, status: 'running' };
  for (let i = 0; i < 6; i++) state = stepMatch(state);
  return state;
}

describe('economic actions', () => {
  it('charges each action immediately, returns IDs and accepts only affordable purchases', () => {
    const initial = createMatch();
    const first = buildTower(initial, 1, 'basic', 4, 6);
    expect(first.result).toEqual({ ok: true, towerId: 1 });
    const second = buildTower(first.state, 1, 'splash', 8, 6);
    expect(second.result).toEqual({ ok: true, towerId: 2 });
    const third = spawnMob(second.state, 1, 'heavy');
    expect(third.result).toEqual({ ok: true, mobId: 3 });
    expect(third.state.players[0].gold).toBe(0);
    const failed = spawnMob(third.state, 1, 'basic');
    expect(failed.result).toEqual({ ok: false, error: 'INSUFFICIENT_GOLD' });
    expect(failed.state).toBe(third.state);
    expect(failed.state.nextEntityId).toBe(4);
    expect(initial.players[0].gold).toBe(200);
    expect(initial.players[0].towers).toEqual([]);
  });

  it('places both types on the opposite field and snapshots their stats', () => {
    const basic = spawnMob(createMatch(), 1, 'basic').state;
    const state = spawnMob(basic, 2, 'heavy').state;
    expect(state.players[1].mobs[0]).toMatchObject({
      ownerId: 1,
      type: 'basic',
      hp: 40,
      speed: 2,
      reward: 5,
      x: 0,
      y: 6,
    });
    expect(state.players[0].mobs[0]).toMatchObject({
      ownerId: 2,
      type: 'heavy',
      hp: 150,
      speed: 1,
      reward: 12,
      x: 0,
      y: 6,
    });
    expect(state.players.map((player) => player.gold)).toEqual([180, 150]);
  });

  it('starts at 200, omits income at tick 0 and pays before subsequent actions', () => {
    const initial = createMatch();
    expect(addIncome(initial)).toBe(initial);
    let state: MatchState = { ...initial, status: 'running' };
    for (let i = 0; i < 10; i++) state = stepMatch(state);
    expect(state.players.map((player) => player.gold)).toEqual([210, 210]);
    const poor = { ...withGold(49), status: 'running' as const, tick: 0 };
    const after = stepMatch(poor, (state) => buildTower(state, 1, 'basic', 4, 6).state);
    expect(after.players[0].towers).toHaveLength(1);
    expect(after.players[0].gold).toBe(0);
    expect(stepMatch({ ...after, status: 'paused' })).toEqual({ ...after, status: 'paused' });
  });

  it('refunds 50% of actual total spending, including fractional gold', () => {
    const state = buildTower(createMatch(), 1, 'basic', 4, 6).state;
    const upgradedFixture = {
      ...state,
      players: [
        { ...state.players[0], towers: [{ ...state.players[0].towers[0], totalSpent: 175 }] },
        state.players[1],
      ] as const,
    };
    const sold = sellTower(upgradedFixture, 1, 1);
    expect(sold.result).toEqual({ ok: true, towerId: 1, refund: 87.5 });
    expect(sold.state.players[0].gold).toBe(237.5);
    expect(sold.state.players[0].towers).toEqual([]);
    expect(sold.state.nextEntityId).toBe(2);
    expect(sellTower(sold.state, 1, 1)).toEqual({
      state: sold.state,
      result: { ok: false, error: 'TOWER_NOT_FOUND' },
    });
    expect(sellTower(state, 2, 1)).toEqual({
      state,
      result: { ok: false, error: 'TOWER_NOT_FOUND' },
    });
  });

  it.each([
    ['basic', 1.5, 2, 'INVALID_ARGUMENT'],
    [null, 1, 2, 'INVALID_ARGUMENT'],
    ['missing', 1, 2, 'UNKNOWN_TYPE'],
    ['basic', NaN, 2, 'INVALID_ARGUMENT'],
    ['basic', -1, 2, 'OUT_OF_BOUNDS'],
    ['basic', 16, 2, 'OUT_OF_BOUNDS'],
    ['basic', 0, 6, 'RESERVED_CELL'],
    ['basic', 15, 6, 'RESERVED_CELL'],
  ] as const)('rejects build(%s, %s, %s) as %s without mutation', (type, x, y, error) => {
    const state = createMatch();
    const action = buildTower(state, 1, type, x, y);
    expect(action.result).toEqual({ ok: false, error });
    expect(action.state).toBe(state);
  });

  it('rejects unknown mob types, bad arguments and unaffordable building without mutation', () => {
    const state = withGold(49);
    for (const action of [
      spawnMob(state, 1, null),
      spawnMob(state, 1, 'missing'),
      buildTower(state, 1, 'basic', 4, 6),
      sellTower(state, 1, '1'),
    ]) {
      expect(action.result.ok).toBe(false);
      expect(action.state).toBe(state);
    }
    const built = buildTower(createMatch(), 1, 'basic', 4, 6).state;
    expect(buildTower(built, 1, 'basic', 4, 6).result).toEqual({
      ok: false,
      error: 'CELL_OCCUPIED',
    });
  });
});

describe('legal maze changes', () => {
  it('rejects the final wall cell when it cuts off the entry', () => {
    let state = withGold(1000);
    for (let y = 0; y < 11; y++) {
      const action = buildTower(state, 1, 'basic', 4, y);
      expect(action.result.ok).toBe(true);
      state = action.state;
    }
    const blocked = buildTower(state, 1, 'basic', 4, 11);
    expect(blocked.result).toEqual({ ok: false, error: 'PATH_BLOCKED' });
    expect(blocked.state).toBe(state);
    expect(state.players[0].gold).toBe(450);
  });

  it('protects a living mob even when the entry still reaches the base', () => {
    const config = structuredClone(GAME_CONFIG);
    config.board.width = 5;
    config.board.height = 5;
    config.board.entry = { x: 0, y: 2 };
    config.board.base = { x: 4, y: 2 };
    let state = spawnMob(createMatch(config), 2, 'basic').state;
    state = buildTower(buildTower(state, 1, 'basic', 1, 0).state, 1, 'basic', 3, 0).state;
    const player = state.players[0];
    const cell = { x: 2, y: 0 };
    state = {
      ...state,
      players: [
        { ...player, mobs: [{ ...player.mobs[0], x: cell.x, y: cell.y, from: cell, to: cell }] },
        state.players[1],
      ],
    };
    const action = buildTower(state, 1, 'basic', 2, 1);
    expect(
      Number.isFinite(
        distanceAt(
          createDistanceField(config.board, [...player.towers, { x: 2, y: 1 }]),
          config.board.entry,
        ),
      ),
    ).toBe(true);
    expect(action.result).toEqual({ ok: false, error: 'PATH_BLOCKED' });
    expect(action.state).toBe(state);
  });

  it('protects both ends of an occupied edge and updates distances without teleporting', () => {
    const state = runningMob();
    for (const x of [1, 2]) {
      expect(buildTower(state, 1, 'basic', x, 6).result).toEqual({
        ok: false,
        error: 'CELL_OCCUPIED',
      });
    }
    const before = state.players[0].mobs[0];
    const built = buildTower(state, 1, 'basic', 3, 6);
    expect(built.result.ok).toBe(true);
    const rerouted = built.state.players[0].mobs[0];
    expect(rerouted.x).toBe(before.x);
    expect(rerouted.from).toEqual(before.from);
    expect(rerouted.to).toEqual(before.to);
    expect(rerouted.remainingDistance).toBeCloseTo(before.remainingDistance + 2);
    if (!built.result.ok) throw new Error('Expected legal build');
    const sold = sellTower(built.state, 1, built.result.towerId);
    expect(sold.state.players[0].mobs[0].remainingDistance).toBeCloseTo(before.remainingDistance);
    expect(sold.state.players[0].mobs[0].x).toBe(before.x);
  });

  it('does not charge for illegal actions and allows the next legal action in the same step', () => {
    const state = createMatch();
    const failed = buildTower(state, 1, 'basic', 0, 6);
    const legal = buildTower(failed.state, 1, 'basic', 4, 6);
    expect(legal.result.ok).toBe(true);
    expect(legal.state.players[0].gold).toBe(150);
    expect(legal.state.players[0].towers[0].id).toBe(1);
  });
});
