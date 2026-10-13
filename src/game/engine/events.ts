import type { Cell } from '../config/game-config';
import type { PlayerId } from './model';

/** Resolved attacks for presentation only; effects never change damage. */
export interface AttackEvent {
  readonly tick: number;
  readonly playerId: PlayerId;
  readonly towerId: number;
  readonly targetMobId: number;
  readonly from: Cell;
  readonly target: Cell;
  readonly splashRadius: number;
}
