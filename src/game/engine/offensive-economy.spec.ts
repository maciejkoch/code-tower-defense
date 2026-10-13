import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/game-config';
import { buildTower, spawnMob, upgradeMob } from './actions';
import { resolveCombat } from './combat';
import { createMatch } from './create-match';
import { addIncome } from './economy';
import { stepMatch } from './step';
import { createSnapshots } from '../strategy/snapshot';

describe('production economy', () => {
  it('raises only the producer income, pays it from the next tick and exposes it to strategies', () => {
    const initial = createMatch();
    const basic = spawnMob(initial, 1, 'basic').state;
    const heavy = spawnMob(basic, 2, 'heavy').state;
    expect(heavy.players.map((p) => p.income)).toEqual([30.2, 30.6]);
    expect(initial.players.map((p) => p.income)).toEqual([30, 30]);
    expect(addIncome(heavy)).toBe(heavy);
    const paid = addIncome({ ...heavy, tick: 1 });
    expect(paid.players[0].gold).toBeCloseTo(190 + 3.02);
    expect(paid.players[1].gold).toBeCloseTo(170 + 3.06);
    const snapshots = createSnapshots(paid);
    expect(snapshots[0].self.income).toBe(30.2);
    expect(snapshots[1].opponent.income).toBe(30.2);
    expect(Object.isFrozen(snapshots[0].self)).toBe(true);
  });

  it('caps total income at 90 G/s including base income, without preventing further production', () => {
    const config = structuredClone(GAME_CONFIG);
    config.economy.startingGold = 10000;
    let state = createMatch(config);
    for (let i = 0; i < 299; i++) state = spawnMob(state, 1, 'basic').state;
    expect(state.players[0].income).toBe(89.8);
    state = spawnMob(state, 1, 'heavy').state;
    expect(state.players[0].income).toBe(90);
    state = spawnMob(state, 1, 'basic').state;
    expect(state.players[0].income).toBe(90);
    expect(state.players[1].mobs.length + state.players[1].queuedMobs.length).toBe(301);
    expect(state.players[1].income).toBe(30);
    const paid = addIncome({ ...state, tick: 1 });
    expect(paid.players[0].gold - state.players[0].gold).toBe(9);
  });

  it('does not grant income for rejected production or other purchases', () => {
    const built = buildTower(createMatch(), 1, 'basic', 4, 6).state;
    expect(built.players[0].income).toBe(30);
    const poor = {
      ...built,
      players: [{ ...built.players[0], gold: 0 }, built.players[1]] as const,
    };
    expect(spawnMob(poor, 1, 'basic').state).toBe(poor);
    expect(spawnMob(built, 1, 'unknown').state).toBe(built);
  });

  it('retains the producer bonus after a kill and pays the defender the new reward once', () => {
    for (const type of ['basic', 'heavy'] as const) {
      const built = buildTower(createMatch(), 1, 'basic', 3, 6).state;
      const produced = spawnMob(built, 2, type).state;
      const ready = {
        ...produced,
        status: 'running' as const,
        players: [
          {
            ...produced.players[0],
            mobs: produced.players[0].mobs.map((mob) => ({ ...mob, hp: 1 })),
          },
          produced.players[1],
        ] as const,
      };
      const killed = resolveCombat(ready, 0);
      expect(killed.players[0].mobs).toEqual([]);
      expect(killed.players[0].gold).toBe(ready.players[0].gold + (type === 'basic' ? 1 : 3));
      expect(killed.players[1].income).toBe(type === 'basic' ? 30.2 : 30.6);
      expect(resolveCombat(killed, 0).players[0].gold).toBe(killed.players[0].gold);
    }
  });

  it('retains the bonus after a leak and freezes all economy while paused', () => {
    const config = structuredClone(GAME_CONFIG);
    config.board.base.x = 1;
    config.mobs.basic.speed = 10;
    const ready = {
      ...spawnMob(createMatch(config), 1, 'basic').state,
      status: 'running' as const,
    };
    const leaked = stepMatch(ready);
    expect(leaked.players[1].leaks).toBe(1);
    expect(leaked.players[1].mobs).toEqual([]);
    expect(leaked.players[0].income).toBe(30.2);
    const paused = { ...leaked, status: 'paused' as const };
    expect(stepMatch(paused)).toBe(paused);
    expect(createMatch(config).players[0].income).toBe(30);
  });

  it('charges 100/200 G for each type and applies upgrades only to future mobs', () => {
    for (const type of ['basic', 'heavy'] as const) {
      const config = structuredClone(GAME_CONFIG);
      config.economy.startingGold = 500;
      const initial = spawnMob(createMatch(config), 1, type).state;
      const levelTwo = upgradeMob(initial, 1, type).state;
      expect(initial.players[0].gold - levelTwo.players[0].gold).toBe(100);
      const levelThree = upgradeMob(levelTwo, 1, type).state;
      expect(levelTwo.players[0].gold - levelThree.players[0].gold).toBe(200);
      expect(levelThree.players[0].income).toBe(initial.players[0].income);
      const produced = spawnMob(levelThree, 1, type).state;
      expect(
        [...produced.players[1].mobs, ...produced.players[1].queuedMobs].map((mob) => mob.maxHp),
      ).toEqual([config.mobs[type].hp, config.mobs[type].hp * 6]);
    }
  });
});
