import type { BoardConfig, Cell } from '../config/game-config';

export interface DistanceField {
  readonly width: number;
  readonly distances: readonly number[];
}

const DIRECTIONS = {
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
};

export function sameCell(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

export function insideBoard(board: BoardConfig, cell: Cell): boolean {
  return (
    Number.isInteger(cell.x) &&
    Number.isInteger(cell.y) &&
    cell.x >= 0 &&
    cell.x < board.width &&
    cell.y >= 0 &&
    cell.y < board.height
  );
}

/** One reverse BFS serves every mob on the field. Infinity means unreachable. */
export function createDistanceField(
  board: BoardConfig,
  blocked: readonly Cell[] = [],
): DistanceField {
  const distances = Array<number>(board.width * board.height).fill(Infinity);
  const index = (cell: Cell) => cell.y * board.width + cell.x;
  const walls = new Set(blocked.filter((cell) => insideBoard(board, cell)).map(index));
  const field = { width: board.width, distances };
  if (!insideBoard(board, board.base) || walls.has(index(board.base))) return field;
  const queue: Cell[] = [board.base];
  distances[index(board.base)] = 0;
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head];
    for (const direction of board.directionPriority) {
      const delta = DIRECTIONS[direction];
      const next = { x: cell.x + delta.x, y: cell.y + delta.y };
      if (
        !insideBoard(board, next) ||
        walls.has(index(next)) ||
        distances[index(next)] !== Infinity
      )
        continue;
      distances[index(next)] = distances[index(cell)] + 1;
      queue.push(next);
    }
  }
  return field;
}

export function distanceAt(field: DistanceField, cell: Cell): number {
  if (
    !Number.isInteger(cell.x) ||
    !Number.isInteger(cell.y) ||
    cell.x < 0 ||
    cell.x >= field.width ||
    cell.y < 0
  )
    return Infinity;
  return field.distances[cell.y * field.width + cell.x] ?? Infinity;
}

/** Resolve equally short routes using the configured direction order. */
export function nextCell(board: BoardConfig, field: DistanceField, from: Cell): Cell | null {
  const distance = distanceAt(field, from);
  if (!Number.isFinite(distance) || distance === 0) return null;
  for (const direction of board.directionPriority) {
    const delta = DIRECTIONS[direction];
    const next = { x: from.x + delta.x, y: from.y + delta.y };
    if (insideBoard(board, next) && distanceAt(field, next) === distance - 1) return next;
  }
  return null;
}
