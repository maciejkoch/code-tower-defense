import { POLICIES, runTactics } from './tactics.js';
export const name = POLICIES['heavy'].name;
/** @param {import('../game/strategy/contracts').StrategyState} state
 * @param {import('../game/strategy/contracts').StrategyApi} api */
export function onTick(state, api) {
  runTactics(state, api, POLICIES['heavy']);
}
