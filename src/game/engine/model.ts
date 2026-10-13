import type { BoardConfig, Cell, GameConfig } from '../config/game-config';

export type PlayerId = 1 | 2;
export type MobType = 'basic' | 'heavy';
export type MatchStatus = 'ready' | 'running' | 'paused' | 'finished';
export type MatchResult =
  | { readonly reason: 'leak-limit'; readonly winnerId: PlayerId | null }
  | { readonly reason: 'interrupted'; readonly winnerId: null };

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

export interface PlayerState {
  readonly id: PlayerId;
  readonly gold: number;
  readonly leaks: number;
  readonly mobLevels: Readonly<Record<MobType, number>>;
  readonly board: BoardConfig;
  /** Opponent-owned mobs currently on this player's defense field. */
  readonly mobs: readonly MobState[];
}

export interface MatchState {
  readonly status: MatchStatus;
  /** Completed steps; the next step's actions observe this tick. */
  readonly tick: number;
  readonly nextEntityId: number;
  readonly result: MatchResult | null;
  readonly config: GameConfig;
  readonly players: readonly [PlayerState, PlayerState];
}
