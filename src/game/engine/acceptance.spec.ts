import { describe, expect, it, vi } from 'vitest';
import { GAME_CONFIG } from '../config/game-config';
import { spawnMob, upgradeMob } from './actions';
import { createMatch } from './create-match';
import { stepMatch } from './step';
import { MatchSession } from '../runtime/match-session';
import type { MatchState } from './model';

describe('MVP acceptance', () => {
  it.each([
    ['basic', 1],
    ['basic', 2],
    ['basic', 3],
    ['heavy', 1],
    ['heavy', 2],
    ['heavy', 3],
  ] as const)('counts a %s level %i as exactly one leak without a kill reward', (type, level) => {
    const config = structuredClone(GAME_CONFIG);
    config.economy.startingGold = 1000;
    config.board.base.x = 1;
    config.mobs[type].speed = 10;
    let state: MatchState = { ...createMatch(config), status: 'running' };
    for (let i = 1; i < level; i++) state = upgradeMob(state, 1, type).state;
    state = spawnMob(state, 1, type).state;
    const before = state.players[1].gold;
    const next = stepMatch(state);
    expect(next.players[1].leaks).toBe(1);
    expect(next.players[1].mobs).toEqual([]);
    expect(next.players[1].gold - before).toBe(3);
    expect(next.players[1].logs).toEqual([]);
    expect(stepMatch(next).players[1].leaks).toBe(1);
  });

  it('continues an idle match beyond the benchmark deadline with ordinary income', () => {
    const session = new MatchSession(GAME_CONFIG, [
      { name: 'Idle 1', onTick: () => undefined },
      { name: 'Idle 2', onTick: () => undefined },
    ]);
    session.start();
    for (let i = 0; i < 3001; i++) session.step();
    expect(session.state.status).toBe('running');
    expect(session.state.result).toBeNull();
    expect(session.state.players.map((player) => player.gold)).toEqual([9203, 9203]);
    session.interrupt();
    expect(session.state.result).toEqual({ reason: 'interrupted', winnerId: null });
  });

  it('stops queued deployment, income and strategy calls on the losing movement step', () => {
    const config = structuredClone(GAME_CONFIG);
    config.board.base.x = 1;
    config.mobs.basic.speed = 10;
    config.match.leakLimit = 1;
    let state: MatchState = { ...createMatch(config), status: 'running' };
    for (let i = 0; i < 6; i++) state = spawnMob(state, 1, 'basic').state;
    const resolveActions = vi.fn((current: MatchState) => current);
    const next = stepMatch(state, resolveActions);
    expect(next.result).toEqual({ reason: 'leak-limit', winnerId: 1 });
    expect(next.players[1].queuedMobs).toEqual(state.players[1].queuedMobs);
    expect(next.players[0].gold).toBe(state.players[0].gold);
    expect(resolveActions).not.toHaveBeenCalled();
    expect(stepMatch(next, resolveActions)).toBe(next);
  });
});
