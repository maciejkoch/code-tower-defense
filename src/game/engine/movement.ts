import type { BoardConfig } from '../config/game-config';
import type { MobState } from './model';
import { distanceAt, nextCell, sameCell, type DistanceField } from './pathfinding';

const EPSILON = 1e-9;

/** Move along axis-aligned edges, carrying spare distance through corners. */
export function moveMob(
  mob: MobState,
  board: BoardConfig,
  field: DistanceField,
  seconds: number,
): MobState {
  let { from, to, progress } = mob;
  let budget = mob.speed * seconds;
  while (budget > EPSILON && !sameCell(from, board.base)) {
    if (sameCell(from, to)) {
      const next = nextCell(board, field, from);
      if (!next) break;
      to = next;
      progress = 0;
    }
    const distance = Math.min(1 - progress, budget);
    progress += distance;
    budget -= distance;
    if (progress >= 1 - EPSILON) {
      from = to;
      progress = 0;
    }
  }
  const atCenter = sameCell(from, to);
  return {
    ...mob,
    from,
    to,
    progress,
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    remainingDistance: atCenter ? distanceAt(field, from) : 1 - progress + distanceAt(field, to),
  };
}
