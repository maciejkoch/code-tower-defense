import { GAME_CONFIG, type GameConfig } from '../config/game-config';
import { createMatch } from '../engine/create-match';
import { stepMatch } from '../engine/step';
import type { MatchState } from '../engine/model';
import { spawnDemoMobs } from './demo';

/** Match lifecycle and demo orchestration, with no framework or wall clock. */
export class MatchSession {
  private current: MatchState;

  constructor(config: GameConfig = GAME_CONFIG) {
    this.current = createMatch(config);
  }

  get state() {
    return this.current;
  }

  start(): void {
    if (this.current.status === 'ready' || this.current.status === 'paused') {
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
  }

  step(): boolean {
    if (this.current.status === 'running') this.current = stepMatch(spawnDemoMobs(this.current));
    return this.current.status === 'running';
  }
}
