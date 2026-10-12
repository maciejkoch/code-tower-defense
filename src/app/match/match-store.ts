import { computed, Service, signal } from '@angular/core';
import { createMatch } from '../../game/engine/create-match';

@Service()
export class MatchStore {
  private readonly currentMatch = signal(createMatch());
  readonly state = this.currentMatch.asReadonly();
  readonly time = computed(() => this.state().tick * this.state().config.simulation.stepSeconds);
}
