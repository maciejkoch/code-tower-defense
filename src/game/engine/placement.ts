import type { Cell } from '../config/game-config';
import type { PlayerState } from './model';
import { createDistanceField, distanceAt, insideBoard, sameCell } from './pathfinding';

export type PlacementError = 'OUT_OF_BOUNDS' | 'RESERVED_CELL' | 'CELL_OCCUPIED' | 'PATH_BLOCKED';

export function validatePlacement(player: PlayerState, cell: Cell): PlacementError | null {
  if (!insideBoard(player.board, cell)) return 'OUT_OF_BOUNDS';
  if (sameCell(cell, player.board.entry) || sameCell(cell, player.board.base))
    return 'RESERVED_CELL';
  if (
    player.towers.some((tower) => sameCell(tower, cell)) ||
    player.mobs.some((mob) => sameCell(mob.from, cell) || sameCell(mob.to, cell))
  )
    return 'CELL_OCCUPIED';
  const field = createDistanceField(player.board, [...player.towers, cell]);
  if (!Number.isFinite(distanceAt(field, player.board.entry))) return 'PATH_BLOCKED';
  // A mob at a center reroutes there; between centers it finishes its current edge.
  if (player.mobs.some((mob) => !Number.isFinite(distanceAt(field, mob.to)))) return 'PATH_BLOCKED';
  return null;
}
