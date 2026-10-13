import { describe, expect, it } from 'vitest';
import { BASELINE_CONFIG as GAME_CONFIG } from '../balance/profiles';
import { createMatch } from '../engine/create-match';
import { spawnMob } from '../engine/actions';
import { MatchSession } from '../runtime/match-session';
import { createSnapshots } from './snapshot';
import { StrategyRuntime } from './strategy-runtime';
import type { Strategy, StrategyApi, StrategyPair, StrategyState } from './contracts';

const idle: Strategy['onTick'] = () => undefined;
function pair(first: Strategy['onTick'], second: Strategy['onTick'] = idle): StrategyPair {
  return [
    { name: 'First', onTick: first },
    { name: 'Second', onTick: second },
  ];
}
const initial = () => ({ ...createMatch(GAME_CONFIG), status: 'running' as const });

describe('strategy runtime', () => {
  it('observes elapsed movement, income and cooldown at the next tick boundary', () => {
    const session = new MatchSession(
      GAME_CONFIG,
      pair(
        (state, api) => {
          if (state.tick === 0) api.buildTower('basic', 3, 6);
          if (state.tick === 1) {
            expect(state.time).toBe(0.1);
            expect(state.self.gold).toBe(151);
            expect(state.self.mobs[0].x).toBeCloseTo(0.2);
            expect(state.self.towers[0].cooldownRemaining).toBeCloseTo(0.4);
          }
        },
        (state, api) => {
          if (state.tick === 0) api.spawnMob('basic');
        },
      ),
    );
    session.start();
    session.step();
    expect(session.state.status).toBe('running');
  });
  it('gives both players the same frozen beginning-of-tick state despite immediate actions', () => {
    const views: StrategyState[] = [];
    const runtime = new StrategyRuntime(
      pair(
        (state, api) => {
          views.push(state);
          expect(api.spawnMob('basic')).toEqual({ ok: true, mobId: 1 });
          expect(state.self.gold).toBe(200);
          expect(state.self.outgoingMobs).toEqual([]);
        },
        (state) => {
          views.push(state);
          expect(state.opponent.gold).toBe(200);
          expect(state.self.mobs).toEqual([]);
        },
      ),
    );
    const before = initial();
    const after = runtime.run(before);
    expect(views[0].self).toBe(views[1].opponent);
    expect(views[0].config).toBe(views[1].config);
    expect(Object.isFrozen(views[0].self)).toBe(true);
    expect(Object.isFrozen(views[0].config.board.directionPriority)).toBe(true);
    expect(after.players[0].gold).toBe(180);
    expect(after.players[1].mobs).toHaveLength(1);
    expect(before.players[0].gold).toBe(200);
    expect(Object.isFrozen(before.players[0])).toBe(false);
  });

  it('projects sorted public units and a shared outgoing-mob view without engine internals', () => {
    let state = spawnMob(spawnMob(initial(), 1, 'basic').state, 1, 'heavy').state;
    state = {
      ...state,
      players: [
        state.players[0],
        { ...state.players[1], mobs: [...state.players[1].mobs].reverse() },
      ],
    };
    const [first, second] = createSnapshots(state);
    expect(first.self.outgoingMobs.map((mob) => mob.id)).toEqual([1, 2]);
    expect(first.self.outgoingMobs).toBe(first.opponent.mobs);
    expect(second.self.mobs).toBe(first.self.outgoingMobs);
    expect('from' in first.self.outgoingMobs[0]).toBe(false);
    expect('logs' in first.self).toBe(false);
    expect(Reflect.set(first.config.economy, 'startingGold', 999)).toBe(false);
    expect(state.config.economy.startingGold).toBe(200);
  });

  it('executes all five actions in call order and accounts for current gold, not the snapshot', () => {
    const config = structuredClone(GAME_CONFIG);
    config.economy.startingGold = 2000;
    const runtime = new StrategyRuntime(
      pair((state, api) => {
        const built = api.buildTower('basic', 4, 6);
        if (!built.ok) throw new Error('Expected build');
        expect(api.upgradeTower(built.towerId)).toMatchObject({ ok: true, level: 2 });
        expect(api.upgradeTower(built.towerId)).toMatchObject({ ok: true, level: 3 });
        expect(api.upgradeTower(built.towerId)).toEqual({ ok: false, error: 'MAX_LEVEL' });
        expect(api.sellTower(built.towerId)).toMatchObject({ ok: true, refund: 87.5 });
        expect(api.spawnMob('heavy')).toMatchObject({ ok: true, mobId: 2 });
        expect(api.upgradeMob('heavy')).toMatchObject({ ok: true, level: 2 });
        api.spawnMob('heavy');
        api.upgradeMob('heavy');
        api.spawnMob('heavy');
        expect(state.self.gold).toBe(2000);
      }),
    );
    const after = runtime.run({ ...createMatch(config), status: 'running' });
    expect(after.status).toBe('running');
    expect(after.players[0].gold).toBe(1162.5);
    expect(after.players[0].towers).toEqual([]);
    expect(after.players[1].mobs.map((mob) => mob.maxHp)).toEqual([150, 225, 300]);
    expect(after.nextEntityId).toBe(5);
  });

  it('returns action failures without aborting or consuming gold and scopes tower IDs to the owner', () => {
    const runtime = new StrategyRuntime(
      pair(
        (_, api) => {
          expect(api.buildTower('basic', 0, 6)).toEqual({ ok: false, error: 'RESERVED_CELL' });
          expect(api.buildTower('basic', 4, 6)).toMatchObject({ ok: true, towerId: 1 });
          expect(api.spawnMob('unknown')).toEqual({ ok: false, error: 'UNKNOWN_TYPE' });
        },
        (_, api) => {
          expect(api.upgradeTower(1)).toEqual({ ok: false, error: 'TOWER_NOT_FOUND' });
          expect(api.sellTower(1)).toEqual({ ok: false, error: 'TOWER_NOT_FOUND' });
          for (let i = 0; i < 10; i++) expect(api.spawnMob('basic').ok).toBe(true);
          expect(api.spawnMob('basic')).toEqual({ ok: false, error: 'INSUFFICIENT_GOLD' });
          api.log('Kontynuuję po odrzuconej akcji');
        },
      ),
    );
    const after = runtime.run(initial());
    expect(after.status).toBe('running');
    expect(after.players.map((player) => player.gold)).toEqual([150, 0]);
    expect(after.players[0].mobs).toHaveLength(10);
    expect(after.players[1].logs[0].message).toContain('Kontynuuję');
  });

  it('preserves separate mutable memories between ticks and replaces them on reset', () => {
    const references: Record<string, unknown>[][] = [[], []];
    const callback =
      (id: number): Strategy['onTick'] =>
      (_, api) => {
        references[id].push(api.memory);
        api.memory['count'] =
          (typeof api.memory['count'] === 'number' ? api.memory['count'] : 0) + 1;
        api.log(`count=${api.memory['count']}`);
      };
    const runtime = new StrategyRuntime(pair(callback(0), callback(1)));
    let state = runtime.run(initial());
    state = runtime.run({ ...state, tick: 1 });
    expect(references[0][0]).toBe(references[0][1]);
    expect(references[0][0]).not.toBe(references[1][0]);
    expect(references[0][0]['count']).toBe(2);
    expect(state.players[0].logs.map((log) => [log.tick, log.time])).toEqual([
      [0, 0],
      [1, 0.1],
    ]);
    runtime.reset();
    runtime.run(initial());
    expect(references[0][2]).not.toBe(references[0][0]);
    expect(references[0][2]['count']).toBe(1);
  });

  it('turns forbidden observation mutation into an attributed error without altering the game', () => {
    let secondRan = false;
    const runtime = new StrategyRuntime(
      pair(
        (state) => {
          Object.assign(state.self, { gold: 999 });
        },
        () => {
          secondRan = true;
        },
      ),
    );
    const after = runtime.run(initial());
    expect(after.result).toMatchObject({ reason: 'strategy-error', winnerId: null, playerId: 1 });
    expect(after.players[0].gold).toBe(200);
    expect(after.status).toBe('finished');
    expect(secondRan).toBe(false);
  });

  it('attributes non-Error throws to player 2 and stops before combat or movement', () => {
    const session = new MatchSession(
      GAME_CONFIG,
      pair(
        (_, api) => {
          api.spawnMob('basic');
        },
        () => {
          throw 'Celowy błąd';
        },
      ),
    );
    session.start();
    expect(session.state.result).toEqual({
      reason: 'strategy-error',
      winnerId: null,
      playerId: 2,
      message: 'Celowy błąd',
    });
    expect(session.state.tick).toBe(0);
    expect(session.state.players[1].mobs[0]).toMatchObject({ x: 0, y: 6, hp: 40 });
    const finished = session.state;
    session.step();
    session.interrupt();
    session.start();
    expect(session.state).toBe(finished);
    expect(session.state.attacks).toEqual([]);
  });

  it('keeps memory and logs unchanged in pause and starts from empty memory in a new match', () => {
    const strategies = pair((_, api) => {
      api.memory['count'] = (typeof api.memory['count'] === 'number' ? api.memory['count'] : 0) + 1;
      api.log(api.memory['count']);
    });
    const session = new MatchSession(GAME_CONFIG, strategies);
    session.start();
    session.step();
    expect(session.state.players[0].logs.map((log) => log.message)).toEqual(['1', '2']);
    session.pause();
    const paused = session.state;
    session.step();
    expect(session.state).toBe(paused);
    session.start();
    expect(session.state.players[0].logs.map((log) => log.message)).toEqual(['1', '2']);
    session.reset();
    session.start();
    expect(session.state.players[0].logs.map((log) => log.message)).toEqual(['1']);
  });

  it('rejects async onTick and closes the API against delayed mutations', async () => {
    const runtime = new StrategyRuntime(
      pair(async (_, api) => {
        await Promise.resolve();
        api.spawnMob('basic');
      }),
    );
    const after = runtime.run(initial());
    expect(after.result).toMatchObject({ reason: 'strategy-error', playerId: 1, winnerId: null });
    await Promise.resolve();
    expect(after.players[0].gold).toBe(200);
    expect(after.players[1].mobs).toEqual([]);
  });

  it('closes a retained API after the call while permitting arbitrary memory values', () => {
    let saved: StrategyApi | undefined;
    const runtime = new StrategyRuntime(
      pair((_, api) => {
        saved = api;
        api.memory['callback'] = () => 'value';
      }),
    );
    runtime.run(initial());
    expect(() => saved?.spawnMob('basic')).toThrow(/tylko podczas onTick/);
    expect(typeof saved?.memory['callback']).toBe('function');
  });
});
