import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../config/game-config';
import { createMatch } from './create-match';

describe('createMatch', () => {
  it('starts both players at tick zero with the agreed resources and map', () => {
    const match = createMatch();
    expect(match.tick).toBe(0);
    expect(match.status).toBe('ready');
    expect(match.players.map((player) => player.id)).toEqual([1, 2]);
    for (const player of match.players) {
      expect(player.gold).toBe(200);
      expect(player.leaks).toBe(0);
      expect(player.mobLevels).toEqual({ basic: 1, heavy: 1 });
      expect(player.board).toMatchObject({
        width: 16,
        height: 12,
        entry: { x: 0, y: 6 },
        base: { x: 15, y: 6 },
      });
    }
  });

  it('uses configuration overrides and snapshots them for the match', () => {
    const config = structuredClone(GAME_CONFIG);
    config.economy.startingGold = 350;
    config.board.width = 20;
    config.board.base.x = 19;
    const match = createMatch(config);
    config.economy.startingGold = 999;
    config.board.base.x = 10;
    expect(match.config.economy.startingGold).toBe(350);
    for (const player of match.players) {
      expect(player.gold).toBe(350);
      expect(player.board.width).toBe(20);
      expect(player.board.base.x).toBe(19);
    }
  });

  it('does not share player boards or upgrade state between players and matches', () => {
    const first = createMatch();
    const second = createMatch();
    expect(first).toEqual(second);
    expect(first.config).not.toBe(second.config);
    expect(first.players[0].board).not.toBe(first.players[1].board);
    expect(first.players[0].board.entry).not.toBe(first.players[1].board.entry);
    expect(first.players[0].mobLevels).not.toBe(first.players[1].mobLevels);
    expect(first.players[0].board).not.toBe(second.players[0].board);
  });
});
