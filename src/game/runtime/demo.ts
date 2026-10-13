import { DEMO_CONFIG } from '../config/demo-config';
import { buildTower, sellTower, spawnMob, type ActionOutcome } from '../engine/actions';
import type { MatchState, PlayerId } from '../engine/model';

function record<T>(outcome: ActionOutcome<T>, playerId: PlayerId, message: string): MatchState {
  const state = outcome.state;
  const player = state.players[playerId - 1];
  const entry = {
    tick: state.tick,
    time: state.tick * state.config.simulation.stepSeconds,
    kind: outcome.result.ok ? ('success' as const) : ('error' as const),
    message: outcome.result.ok ? message : `${message}: ${outcome.result.error}`,
  };
  const updated = { ...player, logs: [...player.logs, entry] };
  return {
    ...state,
    players: playerId === 1 ? [updated, state.players[1]] : [state.players[0], updated],
  };
}

/** Every demo action uses the same validated economic functions as future strategy APIs. */
export function runDemo(state: MatchState): MatchState {
  const ticks = (seconds: number) => Math.round(seconds / state.config.simulation.stepSeconds);
  for (const playerId of [1, 2] as const) {
    if (state.tick === 0) {
      state = record(
        buildTower(state, playerId, 'basic', DEMO_CONFIG.wallX, DEMO_CONFIG.wallStartY),
        playerId,
        `Budowa basic (${DEMO_CONFIG.wallX}, ${DEMO_CONFIG.wallStartY})`,
      );
      state = record(
        buildTower(state, playerId, 'splash', DEMO_CONFIG.splashCell.x, DEMO_CONFIG.splashCell.y),
        playerId,
        `Budowa splash (${DEMO_CONFIG.splashCell.x}, ${DEMO_CONFIG.splashCell.y})`,
      );
      const entry = state.players[playerId - 1].board.entry;
      state = record(
        buildTower(state, playerId, 'basic', entry.x, entry.y),
        playerId,
        'Próba budowy na wejściu',
      );
      state = record(
        buildTower(state, playerId, 'basic', DEMO_CONFIG.wallX, DEMO_CONFIG.wallStartY),
        playerId,
        'Próba ponownej budowy na zajętym polu',
      );
      state = record(
        buildTower(
          state,
          playerId,
          'splash',
          DEMO_CONFIG.rejectedSplashCell.x,
          DEMO_CONFIG.rejectedSplashCell.y,
        ),
        playerId,
        `Próba budowy splash za ${state.config.towers.splash.cost} G`,
      );
    }
    const buildInterval = Math.max(1, ticks(DEMO_CONFIG.buildIntervalSeconds));
    if (state.tick > 0 && state.tick % buildInterval === 0) {
      const row = DEMO_CONFIG.wallRows[state.tick / buildInterval - 1];
      if (row !== undefined) {
        state = record(
          buildTower(state, playerId, 'basic', DEMO_CONFIG.wallX, row),
          playerId,
          `Rozbudowa ściany (${DEMO_CONFIG.wallX}, ${row})`,
        );
      }
    }
    if (state.tick === ticks(DEMO_CONFIG.sellSeconds)) {
      const tower = state.players[playerId - 1].towers.find(
        (item) => item.x === DEMO_CONFIG.wallX && item.y === DEMO_CONFIG.wallStartY,
      );
      if (tower) {
        const outcome = sellTower(state, playerId, tower.id);
        const refund = outcome.result.ok ? outcome.result.refund : 0;
        state = record(outcome, playerId, `Sprzedaż (${tower.x}, ${tower.y}), zwrot ${refund} G`);
      }
    }
    const spawnInterval = Math.max(1, ticks(DEMO_CONFIG.spawnIntervalSeconds));
    if (state.tick % spawnInterval === 0) {
      const type = (state.tick / spawnInterval) % 3 === 2 ? 'heavy' : 'basic';
      state = record(spawnMob(state, playerId, type), playerId, `Produkcja ${type}`);
    }
  }
  return state;
}
