import type { MatchState, PlayerId } from '../engine/model';
import type { StrategyPair } from './contracts';
import { createSnapshots } from './snapshot';
import { createStrategyApi } from './strategy-api';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  try {
    return String(error);
  } catch {
    return 'Nieznany błąd strategii';
  }
}

export class StrategyRuntime {
  private memories: [Record<string, unknown>, Record<string, unknown>] = [{}, {}];

  constructor(private readonly strategies: StrategyPair) {}

  reset(): void {
    this.memories = [{}, {}];
  }

  run(state: MatchState): MatchState {
    if (state.status !== 'running') return state;
    const snapshots = createSnapshots(state);
    let current = state;
    for (const playerId of [1, 2] as const) {
      const context = { state: current, active: true };
      const api = createStrategyApi(context, playerId, this.memories[playerId - 1]);
      try {
        const returned = this.strategies[playerId - 1].onTick(snapshots[playerId - 1], api);
        if (
          returned &&
          (typeof returned === 'object' || typeof returned === 'function') &&
          'then' in returned &&
          typeof returned.then === 'function'
        ) {
          // Drain rejections while closing the API against delayed actions.
          void Promise.resolve(returned).catch(() => undefined);
          throw new Error('onTick musi być synchroniczne; Promise nie jest obsługiwane.');
        }
        current = context.state;
      } catch (error) {
        return this.fail(context.state, playerId, errorMessage(error));
      } finally {
        context.active = false;
      }
    }
    return current;
  }

  private fail(state: MatchState, playerId: PlayerId, message: string): MatchState {
    const player = state.players[playerId - 1];
    const entry = {
      tick: state.tick,
      time: state.tick * state.config.simulation.stepSeconds,
      kind: 'error' as const,
      message: `Błąd strategii: ${message}`,
    };
    const updated = { ...player, logs: [...player.logs, entry] };
    return {
      ...state,
      status: 'finished',
      attacks: [],
      result: { reason: 'strategy-error', winnerId: null, playerId, message },
      players: playerId === 1 ? [updated, state.players[1]] : [state.players[0], updated],
    };
  }
}
