import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { LogEntry } from '../../game/engine/model';

@Component({
  selector: 'app-player-log',
  imports: [DecimalPipe],
  template: `
    <section class="log" [attr.aria-label]="'Log gracza ' + playerId()">
      <h3>
        LOG GRACZA {{ playerId() }} <span>{{ visibleEntries().length }} wpisów</span>
      </h3>
      <ol tabindex="0" [attr.aria-label]="'Wpisy logu gracza ' + playerId()">
        @for (entry of visibleEntries(); track $index) {
          <li [class.error]="entry.kind === 'error'">
            <time>{{ entry.time | number: '1.1-1' }} s</time><span>{{ entry.message }}</span>
          </li>
        } @empty {
          <li>Uruchom mecz, aby zobaczyć akcje.</li>
        }
      </ol>
    </section>
  `,
  styles: `
    .log {
      border-top: 1px solid #2c3a40;
      padding: 16px 0 18px;
    }
    h3 {
      margin: 0 0 12px;
      font: 10px var(--mono);
      color: #c8d5d9;
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    h3 span {
      color: #9aaeb6;
      font-size: 9px;
    }
    ol {
      list-style: none;
      padding: 0;
      margin: 0;
      height: 150px;
      overflow: auto;
    }
    li {
      display: flex;
      gap: 10px;
      color: #c8d5d9;
      font-size: 11px;
      line-height: 1.6;
      padding: 3px 0;
    }
    ol:focus-visible {
      outline: 2px solid var(--mint);
      outline-offset: 3px;
      border-radius: 4px;
    }
    li span {
      overflow-wrap: anywhere;
      min-width: 0;
    }
    time {
      flex: 0 0 50px;
      color: #9aaeb6;
      font: 10px var(--mono);
      line-height: 1.8;
    }
    .error {
      color: #ffc39a;
    }
  `,
})
export class PlayerLog {
  readonly entries = input.required<readonly LogEntry[]>();
  readonly playerId = input.required<number>();
  protected readonly visibleEntries = computed(() => [...this.entries()].reverse());
}
