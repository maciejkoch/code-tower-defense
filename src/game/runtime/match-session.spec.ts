import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/game-config';
import { createMatch } from '../engine/create-match';
import { stepMatch } from '../engine/step';
import type { MatchState } from '../engine/model';
import { spawnMob } from '../engine/actions';

function spawnBoth(state: MatchState): MatchState {
  return spawnMob(spawnMob(state, 1, 'basic').state, 2, 'basic').state;
}
import { MatchSession } from './match-session';
import { Playback, PLAYBACK_SPEEDS } from './playback';

describe('match session', () => {
  it('spawns before movement, permits overlapping mobs and counts each arrival once', () => {
    const config = structuredClone(GAME_CONFIG);
    config.board.base.x = 1;
    const state = spawnBoth({ ...createMatch(config), status: 'running' });
    const first = state.players[0];
    const stacked = {
      ...state,
      players: [
        { ...first, mobs: [first.mobs[0], { ...first.mobs[0], id: 3 }] },
        state.players[1],
      ] as const,
    };
    let current: MatchState = stacked;
    for (let i = 0; i < 5; i++) current = stepMatch(current);
    expect(current.players.map((player) => player.leaks)).toEqual([2, 1]);
    expect(current.players[0].mobs).toHaveLength(0);
    expect(stepMatch(current).players[0].leaks).toBe(2);
  });

  it('checks both fields together for a draw, or the opposite player for a win', () => {
    const config = structuredClone(GAME_CONFIG);
    config.board.base.x = 1;
    config.mobs.basic.speed = 10;
    config.match.leakLimit = 1;
    const state = spawnBoth({ ...createMatch(config), status: 'running' });
    expect(stepMatch(state).result).toEqual({ reason: 'leak-limit', winnerId: null });
    const onlyFirst = {
      ...state,
      players: [state.players[0], { ...state.players[1], mobs: [] }] as const,
    };
    expect(stepMatch(onlyFirst).result).toEqual({ reason: 'leak-limit', winnerId: 2 });
  });

  it('keeps paused state intact, interrupts from pause and resets units, counters and IDs', () => {
    const session = new MatchSession();
    const initial = session.state;
    session.step();
    expect(session.state).toBe(initial);
    session.start();
    session.step();
    expect(session.state.players[0].mobs[0].x).toBeCloseTo(0.1);
    session.pause();
    const paused = session.state;
    session.step();
    expect(session.state).toBe(paused);
    session.interrupt();
    expect(session.state.result).toEqual({ reason: 'interrupted', winnerId: null });
    const finished = session.state;
    session.start();
    session.step();
    expect(session.state).toBe(finished);
    session.reset();
    expect(session.state).toEqual(initial);
  });

  it('finishes the two JavaScript strategies under the offensive balance and deployment queue', () => {
    const session = new MatchSession();
    session.start();
    for (let i = 0; i < 2000; i++) session.step();
    expect(session.state.tick).toBe(322);
    expect(session.state.result).toEqual({ reason: 'leak-limit', winnerId: 1 });
    expect(session.state.players.map((player) => player.leaks)).toEqual([1, 20]);
  });

  it('loads different strategies, preserves their memories through pause and resets the complete match', () => {
    const session = new MatchSession();
    session.start();
    const initialTick = session.state;
    expect(initialTick.players.map((player) => player.gold)).toEqual([50, 60]);
    expect(initialTick.players[0].towers.map((tower) => tower.level)).toEqual([1]);
    expect(initialTick.players[1].towers).toHaveLength(1);
    for (let i = 0; i < 100; i++) session.step();
    session.pause();
    const paused = session.state;
    session.start();
    expect(session.state.tick).toBe(paused.tick);
    expect(session.state.players[0].logs).toEqual(paused.players[0].logs);
    session.reset();
    expect(session.state).toEqual(createMatch());
    session.start();
    expect(session.state).toEqual(initialTick);
  });

  it('produces identical final states at every speed, with irregular frame timing and speed changes', () => {
    const reference = new MatchSession();
    reference.start();
    for (let tick = 0; tick < 3000 && reference.step(); tick++) {
      /* Headless reference: no wall clock. */
    }
    expect(reference.state.status).toBe('finished');
    for (const speed of PLAYBACK_SPEEDS) {
      const session = new MatchSession();
      const playback = new Playback(100);
      session.start();
      for (let frame = 0; frame < 30000 && session.state.status === 'running'; frame++) {
        playback.advance([7, 29, 16, 48][frame % 4], speed, () => session.step());
      }
      expect(session.state).toEqual(reference.state);
    }
    const session = new MatchSession();
    const playback = new Playback(100);
    session.start();
    for (let frame = 0; frame < 30000 && session.state.status === 'running'; frame++) {
      if (frame % 17 === 0) {
        session.pause();
        session.step();
        session.start();
      }
      playback.advance(16, PLAYBACK_SPEEDS[frame % 4], () => session.step());
    }
    expect(session.state).toEqual(reference.state);
  });
});

describe('Playback', () => {
  it('retains fractional time and backlog instead of losing simulation steps', () => {
    const playback = new Playback(100);
    let steps = 0;
    const step = () => {
      steps++;
      return true;
    };
    playback.advance(49, 2, step);
    expect(steps).toBe(0);
    playback.advance(1, 2, step);
    expect(steps).toBe(1);
    playback.advance(30000, 1, step);
    expect(steps).toBe(101);
    playback.advance(0, 1, step);
    playback.advance(0, 1, step);
    expect(steps).toBe(301);
    playback.reset();
    playback.advance(0, 4, step);
    expect(steps).toBe(301);
  });

  it('stops a frame immediately on match completion and clears old time', () => {
    const playback = new Playback(100);
    expect(playback.advance(1000, 4, () => false)).toBe(1);
    expect(playback.advance(0, 1, () => true)).toBe(0);
  });
});
