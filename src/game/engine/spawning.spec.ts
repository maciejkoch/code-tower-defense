import { describe, expect, it } from 'vitest';
import { buildTower, spawnMob, upgradeMob } from './actions';
import { createMatch } from './create-match';
import { stepMatch } from './step';
import { advanceSpawnQueues } from './spawning';
import { createSnapshots } from '../strategy/snapshot';
import { createDistanceField, distanceAt } from './pathfinding';
import { MatchSession } from '../runtime/match-session';
import type { MatchState } from './model';

function wave(): MatchState {
  let state: MatchState = { ...createMatch(), status: 'running' };
  for (let i = 0; i < 5; i++) state = spawnMob(state, 1, 'basic').state;
  return state;
}

describe('staggered deployment', () => {
  it('charges the whole wave immediately but deploys one unit every 0.2 simulation seconds', () => {
    let state = wave();
    expect(state.players[0].gold).toBe(150);
    expect(state.players[0].income).toBe(31);
    expect(state.players[1].mobs.map((mob) => mob.id)).toEqual([1]);
    expect(state.players[1].queuedMobs.map((mob) => mob.id)).toEqual([2, 3, 4, 5]);
    for (let tick = 1; tick <= 8; tick++) {
      state = stepMatch(state);
      expect(state.players[1].mobs).toHaveLength(1 + Math.floor(tick / 2));
    }
    expect(state.players[1].queuedMobs).toEqual([]);
    expect(state.players[1].mobs.map((mob) => Number(mob.x.toFixed(1)))).toEqual([
      1.6, 1.2, 0.8, 0.4, 0,
    ]);
  });

  it('uses separate FIFO queues per player, also for mixed types and later purchases', () => {
    let state = wave();
    state = spawnMob(state, 2, 'heavy').state;
    state = stepMatch(state);
    state = spawnMob(state, 1, 'heavy').state;
    state = spawnMob(state, 2, 'basic').state;
    expect(state.players[0].mobs[0].type).toBe('heavy');
    expect(state.players[0].queuedMobs[0].type).toBe('basic');
    expect(state.players[1].queuedMobs.map((mob) => mob.id)).toEqual([2, 3, 4, 5, 7]);
    state = stepMatch(state);
    expect(state.players[0].mobs.map((mob) => mob.id)).toEqual([6, 8]);
    expect(state.players[1].mobs.map((mob) => mob.id)).toEqual([1, 2]);
    const views = createSnapshots(state);
    expect(views[0].self.outgoingQueue).toBe(views[0].opponent.queuedMobs);
    expect(views[0].self.outgoingQueue.map((mob) => mob.id)).toEqual([3, 4, 5, 7]);
    expect('from' in views[0].self.outgoingQueue[0]).toBe(false);
    expect(Object.isFrozen(views[0].self.outgoingQueue)).toBe(true);
  });

  it('does not move or target queued mobs, even when the first entrant is killed', () => {
    let state = wave();
    state = buildTower(state, 2, 'basic', 3, 6).state;
    state = {
      ...state,
      players: [
        state.players[0],
        {
          ...state.players[1],
          mobs: state.players[1].mobs.map((mob) => ({ ...mob, hp: 1 })),
        },
      ],
    };
    const after = stepMatch(state);
    expect(after.players[1].mobs).toEqual([]);
    expect(after.players[1].queuedMobs.map((mob) => [mob.x, mob.hp])).toEqual(
      Array(4).fill([0, 40]),
    );
    expect(after.players[1].gold).toBeCloseTo(154);
    const next = stepMatch(after);
    expect(next.players[1].mobs[0]).toMatchObject({ id: 2, x: 0, hp: 40 });
  });

  it('snapshots stats at purchase and refreshes the path when the unit enters', () => {
    let state = wave();
    state = upgradeMob(state, 1, 'basic').state;
    state = spawnMob(state, 1, 'basic').state;
    expect(state.players[1].queuedMobs.at(-1)?.maxHp).toBe(80);
    expect(state.players[1].queuedMobs[0].maxHp).toBe(40);
    state = buildTower(state, 2, 'basic', 4, 6).state;
    state = stepMatch(stepMatch(state));
    const field = createDistanceField(state.players[1].board, state.players[1].towers);
    expect(state.players[1].mobs[1].remainingDistance).toBe(
      distanceAt(field, state.players[1].board.entry),
    );
    expect(state.players[1].mobs[1].remainingDistance).toBe(17);
  });

  it('freezes a partly elapsed queue on pause and clears it completely on reset', () => {
    const session = new MatchSession(undefined, [
      {
        name: 'Wave',
        onTick: (state, api) => {
          if (state.tick === 0) for (let i = 0; i < 5; i++) api.spawnMob('basic');
        },
      },
      { name: 'Idle', onTick: () => undefined },
    ]);
    session.start();
    session.step();
    session.pause();
    const paused = session.state;
    expect(advanceSpawnQueues(paused)).toBe(paused);
    session.step();
    expect(session.state).toBe(paused);
    session.start();
    expect(session.state.players[1].mobs).toHaveLength(1);
    session.step();
    expect(session.state.players[1].mobs).toHaveLength(2);
    session.reset();
    expect(session.state).toEqual(createMatch());
  });
});
