import type { MatchResult, PlayerState } from './model';

export function getOutcome(
  players: readonly [PlayerState, PlayerState],
  leakLimit: number,
): MatchResult | null {
  const firstLost = players[0].leaks >= leakLimit;
  const secondLost = players[1].leaks >= leakLimit;
  if (!firstLost && !secondLost) return null;
  return { reason: 'leak-limit', winnerId: firstLost && secondLost ? null : firstLost ? 2 : 1 };
}
