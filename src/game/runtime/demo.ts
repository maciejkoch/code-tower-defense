import { DEMO_CONFIG } from '../config/demo-config';
import type { MatchState, MobState, PlayerState } from '../engine/model';
import { createDistanceField, distanceAt } from '../engine/pathfinding';

/** Free, symmetric basic mobs. Replaced by player strategies in phase 5. */
export function spawnDemoMobs(state: MatchState): MatchState {
  const interval = Math.max(
    1,
    Math.round(DEMO_CONFIG.spawnIntervalSeconds / state.config.simulation.stepSeconds),
  );
  if (state.tick % interval !== 0) return state;
  let nextEntityId = state.nextEntityId;
  const populate = (defender: PlayerState): PlayerState => {
    const entry = defender.board.entry;
    const stats = state.config.mobs.basic;
    const mob: MobState = {
      id: nextEntityId++,
      ownerId: defender.id === 1 ? 2 : 1,
      type: 'basic',
      level: 1,
      x: entry.x,
      y: entry.y,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      reward: stats.reward,
      from: entry,
      to: entry,
      progress: 0,
      remainingDistance: distanceAt(createDistanceField(defender.board), entry),
    };
    return { ...defender, mobs: [...defender.mobs, mob] };
  };
  const players = [populate(state.players[0]), populate(state.players[1])] as const;
  return { ...state, nextEntityId, players };
}
