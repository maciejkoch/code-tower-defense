import { createDistanceField, distanceAt } from '../engine/pathfinding';
import { MatchSession } from '../runtime/match-session';
import type { GameConfig } from '../config/game-config';
import type { Strategy, StrategyPair } from '../strategy/contracts';
import { POLICIES, runTactics } from '../../strategies/tactics.js';
export { balanceProfiles } from './profiles';

export const BENCHMARK_STRATEGIES: Readonly<Record<string, Strategy>> = Object.fromEntries(
  Object.entries(POLICIES).map(([key, policy]) => [
    key,
    {
      name: policy.name,
      onTick: (state, api) => runTactics(state, api, policy),
    } satisfies Strategy,
  ]),
);

export function simulate(config: GameConfig, strategies: StrategyPair, limitSeconds = 240) {
  const session = new MatchSession(config, strategies);
  session.start();
  let maxLive = 0;
  const maxRoutes = [0, 0];
  const previousTowerCounts = [-1, -1];
  const observe = () => {
    session.state.players.forEach((player, index) => {
      if (previousTowerCounts[index] !== player.towers.length) {
        maxRoutes[index] = Math.max(
          maxRoutes[index],
          distanceAt(createDistanceField(player.board, player.towers), player.board.entry),
        );
        previousTowerCounts[index] = player.towers.length;
      }
    });
    maxLive = Math.max(
      maxLive,
      session.state.players.reduce((sum, player) => sum + player.mobs.length, 0),
    );
  };
  observe();
  const limitTicks = Math.ceil(limitSeconds / config.simulation.stepSeconds);
  while (session.state.status === 'running' && session.state.tick < limitTicks) {
    session.step();
    observe();
  }
  const state = session.state;
  if (state.result?.reason === 'strategy-error')
    throw new Error(`Strategy ${state.result.playerId}: ${state.result.message}`);
  return {
    seconds: Number((state.tick * config.simulation.stepSeconds).toFixed(1)),
    result: state.result,
    leaks: state.players.map((p) => p.leaks),
    income: state.players.map((p) => p.income),
    maxLive,
    maxRoutes,
    towers: state.players.map((p) => p.towers.length),
    produced: state.players.map((p) =>
      p.logs.reduce((sum, log) => sum + Number(/^Fala: (\d+)/.exec(log.message)?.[1] ?? 0), 0),
    ),
    builds: state.players.map(
      (p) => p.logs.filter((log) => log.message.startsWith('Budowa ')).length,
    ),
    levels: state.players.map((p) => p.mobLevels),
  };
}
