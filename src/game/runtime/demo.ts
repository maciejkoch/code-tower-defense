import { DEMO_CONFIG } from '../config/demo-config';
import {
  buildTower,
  sellTower,
  spawnMob,
  upgradeMob,
  upgradeTower,
  type ActionOutcome,
} from '../engine/actions';
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

/** Scripted combat and upgrades, later replaced by onTick strategies. */
export function runDemo(state: MatchState): MatchState {
  const tickAt = (seconds: number) => Math.round(seconds / state.config.simulation.stepSeconds);
  for (const playerId of [1, 2] as const) {
    if (state.tick === 0) {
      for (const type of ['basic', 'splash'] as const) {
        const cell = type === 'basic' ? DEMO_CONFIG.basicCell : DEMO_CONFIG.splashCell;
        state = record(
          buildTower(state, playerId, type, cell.x, cell.y),
          playerId,
          `Budowa ${type} (${cell.x}, ${cell.y})`,
        );
      }
    }
    for (const event of DEMO_CONFIG.towerUpgrades) {
      if (state.tick !== tickAt(event.time)) continue;
      const tower = state.players[playerId - 1].towers.find((tower) => tower.type === event.type);
      if (!tower) continue;
      const action = upgradeTower(state, playerId, tower.id);
      const level = action.result.ok ? action.result.level : tower.level;
      state = record(action, playerId, `Ulepszenie ${event.type}, poziom ${level}`);
    }
    if (DEMO_CONFIG.mobUpgradeTimes.some((time) => state.tick === tickAt(time))) {
      const action = upgradeMob(state, playerId, 'heavy');
      const level = action.result.ok
        ? action.result.level
        : state.players[playerId - 1].mobLevels.heavy;
      state = record(action, playerId, `Ulepszenie produkcji heavy, poziom ${level}`);
    }
    if (state.tick === tickAt(DEMO_CONFIG.releaseSeconds)) {
      for (const tower of state.players[playerId - 1].towers) {
        const action = sellTower(state, playerId, tower.id);
        const refund = action.result.ok ? action.result.refund : 0;
        state = record(
          action,
          playerId,
          `Sprzedaż ${tower.type} poziomu ${tower.level}, zwrot ${refund} G`,
        );
      }
    }
    for (const wave of DEMO_CONFIG.waves) {
      if (state.tick !== tickAt(wave.time)) continue;
      for (let i = 0; i < wave.count; i++)
        state = record(spawnMob(state, playerId, wave.type), playerId, `Produkcja ${wave.type}`);
    }
    const pressureStart = tickAt(DEMO_CONFIG.releaseSeconds);
    const interval = Math.max(1, tickAt(DEMO_CONFIG.pressureIntervalSeconds));
    if (state.tick >= pressureStart && (state.tick - pressureStart) % interval === 0) {
      state = record(spawnMob(state, playerId, 'basic'), playerId, 'Produkcja basic');
    }
  }
  return state;
}
