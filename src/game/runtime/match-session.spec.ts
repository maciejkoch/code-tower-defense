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
    expect(session.state.players[0].mobs[0].x).toBeCloseTo(0.2);
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

  it('finishes the default demonstration at 185.5 seconds with 20 leaks per side', () => {
    const session = new MatchSession();
    session.start();
    for (let i = 0; i < 2000; i++) session.step();
    expect(session.state.tick).toBe(1855);
    expect(session.state.result).toEqual({ reason: 'leak-limit', winnerId: null });
    expect(session.state.players.map((player) => player.leaks)).toEqual([20, 20]);
  });

  it('demonstrates all upgrade levels, snapshots mob health and refunds upgraded defenses', () => {
    const session = new MatchSession();
    session.start();
    expect(session.state.tick).toBe(0);
    expect(session.state.players.map((player) => player.gold)).toEqual([30, 30]);
    session.step();
    expect(session.state.players.map((player) => player.gold)).toEqual([31, 31]);
    while (session.state.tick < 880) session.step();
    for (const player of session.state.players) {
      expect(player.towers.map((tower) => tower.level)).toEqual([3, 3]);
      expect(player.mobLevels.heavy).toBe(2);
      expect(
        player.logs.some((entry) => entry.time === 60 && entry.message.includes('MAX_LEVEL')),
      ).toBe(true);
      expect(player.logs.some((entry) => entry.message.includes('Zabicie'))).toBe(true);
    }
    while (session.state.tick < 920) session.step();
    expect(session.state.players[0].mobs.some((mob) => mob.level === 2 && mob.maxHp === 225)).toBe(
      true,
    );
    while (session.state.tick < 1480) session.step();
    for (const player of session.state.players) {
      expect(player.mobLevels.heavy).toBe(3);
      expect(player.mobs.some((mob) => mob.level === 3 && mob.maxHp === 300)).toBe(true);
    }
    while (session.state.tick < 1600) session.step();
    for (const player of session.state.players) {
      expect(player.towers).toEqual([]);
      expect(
        player.logs.some((entry) => entry.time === 160 && entry.message.includes('zwrot 87.5 G')),
      ).toBe(true);
      expect(
        player.logs.some((entry) => entry.time === 160 && entry.message.includes('zwrot 175 G')),
      ).toBe(true);
      expect(player.gold).toBeGreaterThanOrEqual(0);
    }
  });

  it('produces identical final states at every speed, with irregular frame timing and speed changes', () => {
    const reference = new MatchSession();
    reference.start();
    while (reference.step()) {
      /* Headless reference: no wall clock. */
    }
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
