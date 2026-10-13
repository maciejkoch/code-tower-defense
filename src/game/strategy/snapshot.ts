import type { MatchState, MobState, PlayerState } from '../engine/model';
import type { MobView, PlayerView, StrategyState } from './contracts';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

function mobView({ from: _from, to: _to, progress: _progress, ...mob }: MobState): MobView {
  return mob;
}

/** One cloned, frozen graph supplies both views of the beginning of the tick. */
export function createSnapshots(state: MatchState): readonly [StrategyState, StrategyState] {
  const project = (player: PlayerState) => ({
    id: player.id,
    gold: player.gold,
    income: player.income,
    leaks: player.leaks,
    mobLevels: player.mobLevels,
    board: {
      width: player.board.width,
      height: player.board.height,
      entry: player.board.entry,
      base: player.board.base,
    },
    towers: [...player.towers].sort((a, b) => a.id - b.id),
    mobs: player.mobs.map(mobView).sort((a, b) => a.id - b.id),
    queuedMobs: player.queuedMobs.map(mobView),
  });
  const cloned = structuredClone({ config: state.config, players: state.players.map(project) });
  const first = cloned.players[0],
    second = cloned.players[1];
  const self: PlayerView = {
    ...first,
    outgoingMobs: second.mobs,
    outgoingQueue: second.queuedMobs,
  };
  const opponent: PlayerView = {
    ...second,
    outgoingMobs: first.mobs,
    outgoingQueue: first.queuedMobs,
  };
  const common = {
    tick: state.tick,
    time: state.tick * state.config.simulation.stepSeconds,
    config: cloned.config,
  };
  return freeze([
    { ...common, self, opponent },
    { ...common, self: opponent, opponent: self },
  ] as const);
}
