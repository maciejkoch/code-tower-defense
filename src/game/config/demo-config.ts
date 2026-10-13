/** Temporary phase-3 scenario; independent of the future JavaScript strategy API. */
export const DEMO_CONFIG = {
  spawnIntervalSeconds: 8,
  buildIntervalSeconds: 8,
  wallX: 4,
  wallStartY: 6,
  wallRows: [7, 5, 8, 4, 9, 3, 10, 2, 11, 1, 0],
  splashCell: { x: 8, y: 6 },
  rejectedSplashCell: { x: 10, y: 6 },
  sellSeconds: 92,
} as const;
