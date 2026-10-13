import { GAME_CONFIG, type GameConfig } from '../config/game-config';

export function baselineConfig(): typeof GAME_CONFIG {
  const config = structuredClone(GAME_CONFIG);
  return {
    ...config,
    simulation: { ...config.simulation, mobSpawnIntervalSeconds: 0 },
    economy: { ...config.economy, goldPerSecond: 10, productionIncome: { basic: 0, heavy: 0 } },
    mobs: {
      basic: { ...config.mobs.basic, cost: 20, reward: 5 },
      heavy: { ...config.mobs.heavy, cost: 50, reward: 12 },
    },
    towers: {
      ...config.towers,
      basic: { ...config.towers.basic, damage: 10 },
      splash: {
        ...config.towers.splash,
        damage: 8,
        splashRadius: 1.5,
        maxTargets: Number.MAX_SAFE_INTEGER,
      },
    },
    upgrades: { ...config.upgrades, mobHealthMultipliers: [1, 1.5, 2], mobCosts: [200, 400] },
  };
}

/** Legacy rules are retained for comparisons and mechanics regression fixtures. */
export function balanceProfiles(): Readonly<Record<string, GameConfig>> {
  const baseline = baselineConfig();
  const b1: GameConfig = {
    ...baseline,
    economy: { ...baseline.economy, goldPerSecond: 30 },
    mobs: {
      basic: { ...baseline.mobs.basic, cost: 10, reward: 2 },
      heavy: { ...baseline.mobs.heavy, cost: 30, reward: 5 },
    },
    towers: { ...baseline.towers, basic: { ...baseline.towers.basic, damage: 15 } },
    upgrades: { ...baseline.upgrades, mobHealthMultipliers: [1, 2, 6] },
  };
  return { baseline, b1, active: structuredClone(GAME_CONFIG) };
}

export const BASELINE_CONFIG = baselineConfig();
