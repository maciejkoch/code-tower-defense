import type { MatchState, PlayerState } from './model';
import { moveMob } from './movement';
import { advanceCooldowns, resolveCombat } from './combat';
import { addIncome } from './economy';
import { getOutcome } from './outcome';
import { advanceSpawnQueues } from './spawning';
import { createDistanceField, sameCell } from './pathfinding';

/** No clocks, rendering or demo rules here. Each call advances exactly one fixed step. */
export function stepMatch(
  state: MatchState,
  resolveActions: (state: MatchState) => MatchState = (state) => state,
): MatchState {
  if (state.status !== 'running') return state;
  state = advanceCooldowns(state, state.config.simulation.stepSeconds);
  const advancePlayer = (player: PlayerState): PlayerState => {
    const field = createDistanceField(player.board, player.towers);
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
  const next: MatchState = {
    ...state,
    tick: state.tick + 1,
    attacks: [],
    players,
    result,
    status: result ? 'finished' : 'running',
  };
  // Tick 0 is prepared at Start. Finish its movement interval, then prepare
  // the next tick: income and actions precede that tick's next movement.
  return result ? next : resolveCombat(resolveActions(addIncome(advanceSpawnQueues(next))), 0);
}
