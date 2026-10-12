/** Game rules only. Colors and pixel sizes belong to the renderer. */
export const GAME_CONFIG = {
  board: {
    width: 16,
    height: 12,
    entry: { x: 0, y: 6 },
    base: { x: 15, y: 6 },
    directionPriority: ['right', 'down', 'left', 'up'],
  },
  simulation: { stepSeconds: 0.1 },
  economy: { startingGold: 200, goldPerSecond: 10, sellRefundRatio: 0.5 },
  match: { leakLimit: 20 },
  towers: {
    basic: { cost: 50, damage: 10, attackInterval: 0.5, range: 3 },
    splash: { cost: 100, damage: 8, attackInterval: 1, range: 3, splashRadius: 1.5 },
  },
  mobs: {
    basic: { cost: 20, hp: 40, speed: 2, reward: 5 },
    heavy: { cost: 50, hp: 150, speed: 1, reward: 12 },
  },
  upgrades: {
    towerDamageMultipliers: [1, 1.5, 2],
    towerCostMultipliers: [1, 1.5],
    mobHealthMultipliers: [1, 1.5, 2],
    mobCosts: [200, 400],
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
  readonly simulation: { readonly stepSeconds: number };
  readonly economy: {
    readonly startingGold: number;
    readonly goldPerSecond: number;
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
