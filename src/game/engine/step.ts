import type { MatchState, PlayerState } from './model';
import { moveMob } from './movement';
import { getOutcome } from './outcome';
import { createDistanceField, sameCell } from './pathfinding';

/** No clocks, rendering or demo rules here. Each call advances exactly one fixed step. */
export function stepMatch(state: MatchState): MatchState {
  if (state.status !== 'running') return state;
  const advancePlayer = (player: PlayerState): PlayerState => {
    const field = createDistanceField(player.board);
    const moved = player.mobs.map((mob) =>
      moveMob(mob, player.board, field, state.config.simulation.stepSeconds),
    );
    const arrived = moved.filter((mob) => sameCell(mob.from, player.board.base));
    return {
      ...player,
      leaks: player.leaks + arrived.length,
      mobs: moved.filter((mob) => !sameCell(mob.from, player.board.base)),
    };
  };
  // Resolve both fields before testing defeat, including simultaneous losses.
  const players = [advancePlayer(state.players[0]), advancePlayer(state.players[1])] as const;
  const result = getOutcome(players, state.config.match.leakLimit);
  return {
    ...state,
    tick: state.tick + 1,
    players,
    result,
    status: result ? 'finished' : 'running',
  };
}
