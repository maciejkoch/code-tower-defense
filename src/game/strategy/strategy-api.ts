import {
  buildTower,
  upgradeTower,
  sellTower,
  spawnMob,
  upgradeMob,
  type ActionOutcome,
  type ActionResult,
} from '../engine/actions';
import type { MatchState, PlayerId } from '../engine/model';
import type { StrategyApi } from './contracts';

export interface StrategyContext {
  state: MatchState;
  active: boolean;
}

export function createStrategyApi(
  context: StrategyContext,
  playerId: PlayerId,
  memory: Record<string, unknown>,
): StrategyApi {
  const ensureActive = () => {
    if (!context.active) throw new Error('API gry jest dostępne tylko podczas onTick.');
  };
  const execute = <T>(action: (state: MatchState) => ActionOutcome<T>): ActionResult<T> => {
    ensureActive();
    const outcome = action(context.state);
    context.state = outcome.state;
    return outcome.result;
  };
  return Object.freeze({
    memory,
    buildTower: (type: unknown, x: unknown, y: unknown) =>
      execute((state) => buildTower(state, playerId, type, x, y)),
    upgradeTower: (id: unknown) => execute((state) => upgradeTower(state, playerId, id)),
    sellTower: (id: unknown) => execute((state) => sellTower(state, playerId, id)),
    spawnMob: (type: unknown) => execute((state) => spawnMob(state, playerId, type)),
    upgradeMob: (type: unknown) => execute((state) => upgradeMob(state, playerId, type)),
    log: (message: unknown) => {
      ensureActive();
      const text = String(message);
      const state = context.state;
      const player = state.players[playerId - 1];
      const entry = {
        tick: state.tick,
        time: state.tick * state.config.simulation.stepSeconds,
        kind: 'info' as const,
        message: text,
      };
      const updated = { ...player, logs: [...player.logs, entry] };
      context.state = {
        ...state,
        players: playerId === 1 ? [updated, state.players[1]] : [state.players[0], updated],
      };
    },
  });
}
