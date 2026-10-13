import type { MatchState, PlayerState } from './model';
import { moveMob } from './movement';
import { createDistanceField } from './pathfinding';

/** Release after elapsed movement, before the next actions and combat. */
export function advanceSpawnQueues(state: MatchState): MatchState {
  if (state.status !== 'running') return state;
  const advance = (player: PlayerState): PlayerState => {
    const cooldown = Math.max(
      0,
      player.spawnCooldownRemaining - state.config.simulation.stepSeconds,
    );
    if (cooldown > 1e-9 || !player.queuedMobs.length)
      return { ...player, spawnCooldownRemaining: cooldown };
    const [purchased, ...queuedMobs] = player.queuedMobs;
    const mob = moveMob(
      purchased,
      player.board,
      createDistanceField(player.board, player.towers),
      0,
    );
    return {
      ...player,
      mobs: [...player.mobs, mob],
      queuedMobs,
      spawnCooldownRemaining: state.config.simulation.mobSpawnIntervalSeconds,
    };
  };
  return { ...state, players: [advance(state.players[0]), advance(state.players[1])] };
}
