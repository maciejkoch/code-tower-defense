import type { MatchState, PlayerState } from './model';

/** Income starts at tick 1, before any actions of that step. */
export function addIncome(state: MatchState): MatchState {
  if (state.tick === 0) return state;
  const income = state.config.economy.goldPerSecond * state.config.simulation.stepSeconds;
  const paid = (player: PlayerState): PlayerState => ({ ...player, gold: player.gold + income });
  return { ...state, players: [paid(state.players[0]), paid(state.players[1])] };
}
