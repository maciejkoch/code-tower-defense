import type { BoardConfig, GameConfig } from '../config/game-config';

export type PlayerId = 1 | 2;

/** Phase 1 models the initial state; unit state arrives with movement and combat. */
export interface PlayerState {
  readonly id: PlayerId;
  readonly gold: number;
  readonly leaks: number;
  readonly mobLevels: Readonly<Record<'basic' | 'heavy', number>>;
  readonly board: BoardConfig;
}

export interface MatchState {
  readonly status: 'ready';
  readonly tick: number;
  readonly config: GameConfig;
  readonly players: readonly [PlayerState, PlayerState];
}
