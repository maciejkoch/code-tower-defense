/** Temporary phase-4 scenario. Every action is paid from the player's balance. */
export const DEMO_CONFIG = {
  basicCell: { x: 4, y: 6 },
  splashCell: { x: 8, y: 6 },
  towerUpgrades: [
    { time: 12, type: 'basic' },
    { time: 24, type: 'basic' },
    { time: 48, type: 'splash' },
    { time: 60, type: 'basic' }, // MAX_LEVEL demonstration.
    { time: 72, type: 'splash' },
  ],
  mobUpgradeTimes: [88, 144],
  waves: [
    { time: 0, type: 'basic', count: 1 },
    { time: 8, type: 'heavy', count: 1 },
    { time: 16, type: 'basic', count: 3 },
    { time: 24, type: 'heavy', count: 1 },
    { time: 32, type: 'basic', count: 3 },
    { time: 40, type: 'heavy', count: 1 },
    { time: 78, type: 'heavy', count: 1 },
    { time: 92, type: 'heavy', count: 1 },
    { time: 96, type: 'basic', count: 3 },
    { time: 148, type: 'heavy', count: 1 },
  ],
  releaseSeconds: 160,
  pressureIntervalSeconds: 1,
} as const;
