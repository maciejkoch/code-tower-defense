import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatchStore } from '../match/match-store';

@Component({
  selector: 'app-match-controls',
  imports: [DecimalPipe],
  template: `
    <section class="controls" aria-label="Sterowanie meczem">
      <div class="actions">
        <button
          class="primary"
          (click)="togglePlayback()"
          [disabled]="match.state().status === 'finished'"
        >
          {{ primaryLabel() }}
        </button>
        <button
          (click)="match.interrupt()"
          [disabled]="match.state().status !== 'running' && match.state().status !== 'paused'"
        >
          Przerwij
        </button>
        <button (click)="match.reset()" [disabled]="match.state().status === 'ready'">
          Nowy mecz
        </button>
      </div>
      <div class="speed" role="group" aria-label="Prędkość symulacji">
        <span>PRĘDKOŚĆ</span>
        @for (speed of match.speeds; track speed) {
          <button [attr.aria-pressed]="match.speed() === speed" (click)="match.setSpeed(speed)">
            {{ speed }}×
          </button>
        }
      </div>
    </section>
    @if (match.state().result; as result) {
      <section class="result" role="status" aria-live="polite" aria-atomic="true">
        <strong>{{ match.resultLabel() }}</strong>
        @if (result.reason === 'leak-limit') {
          <span
            >Osiągnięto próg {{ match.state().config.match.leakLimit }} przepuszczeń. Czas:
            {{ match.time() | number: '1.1-1' }} s.</span
          >
        } @else if (result.reason === 'strategy-error') {
          <span>{{ result.message }}</span>
        } @else {
          <span>Rozgrywka została zatrzymana przez użytkownika.</span>
        }
      </section>
    }
  `,
  styles: `
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 0 22px;
    }
    .actions,
    .speed {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    button {
      background: #192329;
      color: #e6edef;
      border: 1px solid #44565e;
      border-radius: 6px;
      padding: 10px 14px;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      background: #2b4146;
    }
    button:focus-visible {
      outline: 2px solid #69ddbe;
      outline-offset: 3px;
    }
    button:disabled {
      opacity: 0.45;
      cursor: default;
    }
    .primary,
    [aria-pressed='true'] {
      color: #10181c;
      background: #69ddbe;
      border-color: #69ddbe;
    }
    .primary:hover:not(:disabled),
    [aria-pressed='true']:hover {
      background: #92ebd3;
    }
    .speed > span {
      color: #9aaeb6;
      font: 10px var(--mono);
      margin-right: 8px;
    }
    .result {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: baseline;
      background: #18332e;
      border: 1px solid #38534d;
      padding: 18px;
      margin: 0 0 22px;
      border-radius: 8px;
    }
    .result strong {
      color: #69ddbe;
    }
    .result span {
      color: #c8d5d9;
      font-size: 13px;
      overflow-wrap: anywhere;
      min-width: 0;
    }
  `,
})
export class MatchControls {
  protected readonly match = inject(MatchStore);
  protected readonly primaryLabel = computed(
    () =>
      ({
        ready: '▶ Start',
        running: 'Pauza',
        paused: 'Wznów',
        finished: 'Zakończony',
      })[this.match.state().status],
  );

  protected togglePlayback(): void {
    if (this.match.state().status === 'running') this.match.pause();
    else this.match.start();
  }
}
