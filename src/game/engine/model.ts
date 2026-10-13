import type { AttackEvent } from './events';
import type { BoardConfig, Cell, GameConfig } from '../config/game-config';

export type PlayerId = 1 | 2;
export type MobType = 'basic' | 'heavy';
export type TowerType = 'basic' | 'splash';
export type MatchStatus = 'ready' | 'running' | 'paused' | 'finished';
export type MatchResult =
  | { readonly reason: 'leak-limit'; readonly winnerId: PlayerId | null }
  | { readonly reason: 'interrupted'; readonly winnerId: null }
  | {
      readonly reason: 'strategy-error';
      readonly winnerId: null;
      readonly playerId: PlayerId;
      readonly message: string;
    };

export interface MobState {
  readonly id: number;
  readonly ownerId: PlayerId;
  readonly type: MobType;
  readonly level: number;
  readonly x: number;
  readonly y: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly speed: number;
  readonly reward: number;
  readonly remainingDistance: number;
  // Internal movement state: finish this edge before choosing the next one.
  readonly from: Cell;
  readonly to: Cell;
  readonly progress: number;
}

export interface TowerState {
  readonly id: number;
  readonly type: TowerType;
  readonly level: number;
  readonly x: number;
  readonly y: number;
  readonly damage: number;
  readonly range: number;
  readonly attackInterval: number;
  readonly cooldownRemaining: number;
  readonly totalSpent: number;
}

export interface LogEntry {
  readonly tick: number;
  readonly time: number;
  readonly message: string;
  readonly kind: 'success' | 'error' | 'info';
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly gold: number;
  /** Total G/s, including permanent production bonuses. */
  readonly income: number;
  readonly leaks: number;
  readonly mobLevels: Readonly<Record<MobType, number>>;
  readonly board: BoardConfig;
  readonly towers: readonly TowerState[];
  readonly logs: readonly LogEntry[];
  /** Opponent-owned mobs currently on this player's defense field. */
  readonly mobs: readonly MobState[];
  /** Purchased opponents' units waiting to enter this defense field, in FIFO order. */
  readonly queuedMobs: readonly MobState[];
  readonly spawnCooldownRemaining: number;
}

export interface MatchState {
  readonly status: MatchStatus;
  /** Completed movement intervals; current tick's actions and combat are already prepared. */
  readonly tick: number;
  readonly nextEntityId: number;
  readonly result: MatchResult | null;
  readonly attacks: readonly AttackEvent[];
  readonly config: GameConfig;
  readonly players: readonly [PlayerState, PlayerState];
}
