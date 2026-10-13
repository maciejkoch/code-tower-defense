import { GAME_CONFIG, type GameConfig } from '../config/game-config';
import { createMatch } from '../engine/create-match';
import { resolveCombat } from '../engine/combat';
import { stepMatch } from '../engine/step';
import type { MatchState } from '../engine/model';
import { StrategyRuntime } from '../strategy/strategy-runtime';
import { DEFAULT_STRATEGIES } from '../strategy/default-strategies';
import type { StrategyPair } from '../strategy/contracts';

/** Match lifecycle and strategy orchestration, with no framework or wall clock. */
export class MatchSession {
  private current: MatchState;
  private readonly runtime: StrategyRuntime;

  constructor(config: GameConfig = GAME_CONFIG, strategies: StrategyPair = DEFAULT_STRATEGIES) {
    this.current = createMatch(config);
    this.runtime = new StrategyRuntime(strategies);
  }

  get state() {
    return this.current;
  }

  start(): void {
    if (this.current.status === 'ready') {
      this.current = resolveCombat(this.runtime.run({ ...this.current, status: 'running' }), 0);
    } else if (this.current.status === 'paused') {
      this.current = { ...this.current, status: 'running' };
    }
  }

  pause(): void {
    if (this.current.status === 'running') this.current = { ...this.current, status: 'paused' };
  }

  interrupt(): void {
    if (this.current.status === 'running' || this.current.status === 'paused') {
      this.current = {
        ...this.current,
        status: 'finished',
        result: { reason: 'interrupted', winnerId: null },
      };
    }
  }

  reset(): void {
    this.current = createMatch(this.current.config);
    this.runtime.reset();
  }

  step(): boolean {
    if (this.current.status === 'running')
      this.current = stepMatch(this.current, (state) => this.runtime.run(state));
    return this.current.status === 'running';
  }
}
