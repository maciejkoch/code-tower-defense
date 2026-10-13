import { GAME_CONFIG, type GameConfig } from '../config/game-config';
import type { MatchState, PlayerId, PlayerState } from './model';

export function createMatch(config: GameConfig = GAME_CONFIG): MatchState {
  // Each match owns its configuration; no shared mutable state between matches.
  const matchConfig = structuredClone(config);
  const createPlayer = (id: PlayerId): PlayerState => ({
    id,
    gold: matchConfig.economy.startingGold,
    leaks: 0,
    mobLevels: { basic: 1, heavy: 1 },
    board: structuredClone(matchConfig.board),
    mobs: [],
  });

  return {
    status: 'ready',
    result: null,
    nextEntityId: 1,
    tick: 0,
    config: matchConfig,
    players: [createPlayer(1), createPlayer(2)],
  };
}
