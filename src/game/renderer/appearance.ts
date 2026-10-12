import type { PlayerId } from '../engine/model';

/** Presentation catalog, independent of game rules. */
export const APPEARANCE = {
  cellSize: 36,
  padding: 28,
  background: 0x11191f,
  cell: 0x172229,
  alternateCell: 0x19252c,
  grid: 0x2a3941,
  coordinates: 0x9cabb3,
  entry: 0xc6d0d5,
  players: { 1: '#69ddbe', 2: '#ffb77d' } satisfies Record<PlayerId, string>,
};
