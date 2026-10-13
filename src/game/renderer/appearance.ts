import type { PlayerId } from '../engine/model';

/** Presentation catalog, independent of game rules. */
export const APPEARANCE = {
  cellSize: 36,
  mobSprites: {
    basic: { textureScale: 0.1, shadowWidth: 7, healthOffset: 25 },
    heavy: { textureScale: 0.12, shadowWidth: 10, healthOffset: 29 },
  },
  mobAnimations: {
    spawnSeconds: 0.12,
    hitSeconds: 0.1,
    fadeSeconds: 0.2,
    maxPredictionSeconds: 0.1,
  },
  projectiles: {
    speedCellsPerSecond: 12,
    minFlightSeconds: 0.12,
    explosionSeconds: 0.28,
    radius: 3,
  },
  padding: 28,
  background: 0x11191f,
  cell: 0x172229,
  alternateCell: 0x19252c,
  grid: 0x2a3941,
  coordinates: 0x9cabb3,
  entry: 0xc6d0d5,
  players: { 1: '#69ddbe', 2: '#ffb77d' } satisfies Record<PlayerId, string>,
};
