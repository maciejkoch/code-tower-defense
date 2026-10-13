import * as playerOne from '../../strategies/player-one.js';
import * as playerTwo from '../../strategies/player-two.js';
import type { StrategyPair } from './contracts';

export const DEFAULT_STRATEGIES: StrategyPair = [playerOne, playerTwo];
