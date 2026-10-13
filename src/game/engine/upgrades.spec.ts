import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/game-config';
import { buildTower, sellTower, spawnMob, upgradeMob, upgradeTower } from './actions';
import { createMatch } from './create-match';

function rich() {
  const config = structuredClone(GAME_CONFIG);
  config.economy.startingGold = 2000;
  return createMatch(config);
}

describe('upgrades', () => {
  it.each(['basic', 'splash'] as const)(
    'upgrades one %s tower twice, charges costs and refunds the full spending ratio',
    (type) => {
      const built = buildTower(rich(), 1, type, 4, 6);
      if (!built.result.ok) throw new Error('Expected tower');
      const id = built.result.towerId;
      const second = upgradeTower(built.state, 1, id);
      const base = GAME_CONFIG.towers[type];
      expect(second.result).toEqual({ ok: true, towerId: id, level: 2 });
      expect(second.state.players[0].towers[0].damage).toBe(base.damage * 1.5);
      const third = upgradeTower(second.state, 1, id);
      const tower = third.state.players[0].towers[0];
      expect(tower).toMatchObject({
        level: 3,
        damage: base.damage * 2,
        range: base.range,
        attackInterval: base.attackInterval,
        totalSpent: base.cost * 3.5,
      });
      expect(third.state.players[0].gold).toBe(2000 - tower.totalSpent);
      const capped = upgradeTower(third.state, 1, id);
      expect(capped).toEqual({ state: third.state, result: { ok: false, error: 'MAX_LEVEL' } });
      const sold = sellTower(third.state, 1, id);
      expect(sold.result).toEqual({ ok: true, towerId: id, refund: tower.totalSpent * 0.5 });
      expect(sold.state.players[0].gold).toBe(2000 - tower.totalSpent * 0.5);
    },
  );

  it.each(['basic', 'heavy'] as const)(
    'changes only future %s mobs, keeping cost, speed and reward fixed',
    (type) => {
      const first = spawnMob(rich(), 1, type).state;
      const second = spawnMob(upgradeMob(first, 1, type).state, 1, type).state;
      const third = spawnMob(upgradeMob(second, 1, type).state, 1, type).state;
      const stats = GAME_CONFIG.mobs[type];
      expect(third.players[1].mobs.map((mob) => [mob.level, mob.maxHp])).toEqual([
        [1, stats.hp],
        [2, stats.hp * 1.5],
        [3, stats.hp * 2],
      ]);
      for (const mob of third.players[1].mobs)
        expect(mob).toMatchObject({ hp: mob.maxHp, speed: stats.speed, reward: stats.reward });
      expect(third.players[0].gold).toBe(2000 - 600 - stats.cost * 3);
      expect(third.players[1].mobLevels[type]).toBe(1);
      expect(upgradeMob(third, 1, type)).toEqual({
        state: third,
        result: { ok: false, error: 'MAX_LEVEL' },
      });
      expect(first.players[1].mobs[0].hp).toBe(stats.hp);
    },
  );

  it('rejects missing/foreign towers, invalid types and unaffordable upgrades without mutations', () => {
    const state = buildTower(createMatch(), 1, 'splash', 4, 6).state;
    const expensive = upgradeTower(state, 1, 1).state; // Balance 0 after level 2.
    const checks = [
      [expensive, upgradeTower(expensive, 1, 1), 'INSUFFICIENT_GOLD'],
      [state, upgradeTower(state, 2, 1), 'TOWER_NOT_FOUND'],
      [state, upgradeTower(state, 1, 999), 'TOWER_NOT_FOUND'],
      [state, upgradeTower(state, 1, '1'), 'INVALID_ARGUMENT'],
      [state, upgradeMob(state, 1, 'heavy'), 'INSUFFICIENT_GOLD'],
      [state, upgradeMob(state, 1, 'unknown'), 'UNKNOWN_TYPE'],
      [state, upgradeMob(state, 1, null), 'INVALID_ARGUMENT'],
    ] as const;
    for (const [before, outcome, error] of checks) {
      expect(outcome.result).toEqual({ ok: false, error });
      expect(outcome.state).toBe(before);
    }
  });
});
