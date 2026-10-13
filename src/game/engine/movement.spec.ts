import { describe, expect, it } from 'vitest';
import { GAME_CONFIG, type BoardConfig } from '../config/game-config';
import { createDistanceField, distanceAt, nextCell } from './pathfinding';
import { moveMob } from './movement';
import type { MobState } from './model';

const board: BoardConfig = {
  ...GAME_CONFIG.board,
  width: 3,
  height: 3,
  entry: { x: 0, y: 1 },
  base: { x: 2, y: 1 },
};
const mob: MobState = {
  id: 1,
  ownerId: 2,
  type: 'basic',
  level: 1,
  x: 0,
  y: 1,
  hp: 40,
  maxHp: 40,
  speed: 2.5,
  reward: 5,
  from: board.entry,
  to: board.entry,
  progress: 0,
  remainingDistance: 2,
};

describe('routing and movement', () => {
  it('finds a shortest detour and breaks equal routes in configured order', () => {
    const field = createDistanceField(board, [{ x: 1, y: 1 }]);
    expect(distanceAt(field, board.entry)).toBe(4);
    expect(nextCell(board, field, board.entry)).toEqual({ x: 0, y: 2 });
    const alternate = { ...board, directionPriority: ['up', 'right', 'down', 'left'] as const };
    expect(nextCell(alternate, field, board.entry)).toEqual({ x: 0, y: 0 });
  });

  it('reports unreachable cells without looping or moving the mob', () => {
    const field = createDistanceField(board, [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ]);
    expect(distanceAt(field, board.entry)).toBe(Infinity);
    expect(nextCell(board, field, board.entry)).toBeNull();
    expect(moveMob(mob, board, field, 10)).toMatchObject({
      x: 0,
      y: 1,
      remainingDistance: Infinity,
    });
  });

  it('carries movement across several corners without diagonal shortcuts', () => {
    const field = createDistanceField(board, [{ x: 1, y: 1 }]);
    const moved = moveMob(mob, board, field, 1);
    expect(moved).toMatchObject({ x: 1.5, y: 2, progress: 0.5, remainingDistance: 1.5 });
    expect(mob.x).toBe(0);
    const arrived = moveMob(moved, board, field, 1);
    expect(arrived).toMatchObject({ x: 2, y: 1, remainingDistance: 0, progress: 0 });
  });

  it('finishes an existing edge before choosing a route on a changed board', () => {
    const straight = createDistanceField(board);
    const between = moveMob({ ...mob, speed: 1 }, board, straight, 0.5);
    const changed = { ...board, base: { x: 0, y: 0 } };
    const moved = moveMob(between, changed, createDistanceField(changed), 0.5);
    expect(moved).toMatchObject({ x: 1, y: 1, progress: 0 });
  });

  it('uses configured speed and produces the same position after ten fixed steps', () => {
    const large = GAME_CONFIG.board;
    const field = createDistanceField(large);
    const start = {
      ...mob,
      speed: 2,
      x: large.entry.x,
      y: large.entry.y,
      from: large.entry,
      to: large.entry,
    };
    let current = start;
    for (let i = 0; i < 10; i++) current = moveMob(current, large, field, 0.1);
    expect(current.x).toBe(2);
    expect(current.y).toBe(6);
    expect(current.remainingDistance).toBe(13);
  });
});
