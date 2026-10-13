/** Offensive balance B2. Game rules only; rendering has separate configuration. */
export const GAME_CONFIG = {
  board: {
    width: 16,
    height: 12,
    entry: { x: 0, y: 6 },
    base: { x: 15, y: 6 },
    directionPriority: ['right', 'down', 'left', 'up'],
  },
  simulation: { stepSeconds: 0.1, mobSpawnIntervalSeconds: 0.2 },
  economy: {
    startingGold: 200,
    goldPerSecond: 30,
    productionIncome: { basic: 0.2, heavy: 0.6 },
    maxGoldPerSecond: 90,
    sellRefundRatio: 0.5,
  },
  match: { leakLimit: 20 },
  towers: {
    basic: { cost: 50, damage: 15, attackInterval: 0.5, range: 3 },
    splash: { cost: 100, damage: 8, attackInterval: 1, range: 3, splashRadius: 1.5, maxTargets: 6 },
  },
  mobs: {
    basic: { cost: 10, hp: 40, speed: 2, reward: 1 },
    heavy: { cost: 30, hp: 150, speed: 1, reward: 3 },
  },
  upgrades: {
    towerDamageMultipliers: [1, 1.5, 2],
    towerCostMultipliers: [1, 1.5],
    mobHealthMultipliers: [1, 2, 6],
    mobCosts: [100, 200],
  },
} satisfies GameConfig;

export interface Cell {
  readonly x: number;
  readonly y: number;
}

export interface BoardConfig {
  readonly width: number;
  readonly height: number;
  readonly entry: Cell;
  readonly base: Cell;
  readonly directionPriority: readonly ('right' | 'down' | 'left' | 'up')[];
}

export interface GameConfig {
  readonly board: BoardConfig;
  readonly simulation: { readonly stepSeconds: number; readonly mobSpawnIntervalSeconds: number };
  readonly economy: {
    readonly startingGold: number;
    readonly goldPerSecond: number;
    readonly productionIncome: Readonly<Record<'basic' | 'heavy', number>>;
    readonly maxGoldPerSecond: number;
    readonly sellRefundRatio: number;
  };
  readonly match: { readonly leakLimit: number };
  readonly towers: Readonly<
    Record<
      'basic' | 'splash',
      {
        readonly cost: number;
        readonly damage: number;
        readonly attackInterval: number;
        readonly range: number;
        readonly splashRadius?: number;
        readonly maxTargets?: number;
      }
    >
  >;
  readonly mobs: Readonly<
    Record<
      'basic' | 'heavy',
      {
        readonly cost: number;
        readonly hp: number;
        readonly speed: number;
        readonly reward: number;
      }
    >
  >;
  readonly upgrades: {
    readonly towerDamageMultipliers: readonly [number, number, number];
    readonly towerCostMultipliers: readonly [number, number];
    readonly mobHealthMultipliers: readonly [number, number, number];
    readonly mobCosts: readonly [number, number];
  };
}
