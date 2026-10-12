import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  InjectionToken,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { BoardConfig } from '../../game/config/game-config';
import type { PlayerId } from '../../game/engine/model';
import { APPEARANCE } from '../../game/renderer/appearance';
import type { BoardRenderer } from '../../game/renderer/board-renderer';

type RendererHandle = Pick<BoardRenderer, 'mount' | 'destroy'>;

export const LOAD_BOARD_RENDERER = new InjectionToken<() => Promise<RendererHandle>>(
  'Load board renderer',
  {
    providedIn: 'root',
    factory: () => async () => {
      const { BoardRenderer } = await import('../../game/renderer/board-renderer');
      return new BoardRenderer();
    },
  },
);

@Component({
  selector: 'app-board',
  template: `
    <div
      #surface
      role="img"
      [attr.aria-label]="description()"
      class="surface"
      [style.aspect-ratio]="aspectRatio()"
    ></div>
    @if (error()) {
      <p class="error" role="alert">
        Nie udało się wyświetlić planszy. Odśwież stronę i sprawdź, czy przeglądarka obsługuje
        WebGL.
      </p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .surface {
      width: 100%;
      background: #11191f;
      border-radius: 8px;
      overflow: hidden;
    }
    .error {
      color: #ffc39a;
      padding: 12px;
      line-height: 1.6;
    }
  `,
})
export class Board {
  readonly board = input.required<BoardConfig>();
  readonly playerId = input.required<PlayerId>();
  protected readonly error = signal(false);
  private readonly loadRenderer = inject(LOAD_BOARD_RENDERER);
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');
  protected readonly description = computed(() => {
    const board = this.board();
    return (
      `Pole obrony gracza ${this.playerId()}: ${board.width} na ${board.height} pól. ` +
      `Wejście (${board.entry.x}, ${board.entry.y}), baza (${board.base.x}, ${board.base.y}). Plansza jest pusta.`
    );
  });
  protected readonly aspectRatio = computed(() => {
    const board = this.board();
    const { cellSize, padding } = APPEARANCE;
    return `${board.width * cellSize + padding * 2} / ${board.height * cellSize + padding * 2}`;
  });

  constructor() {
    afterRenderEffect((onCleanup) => {
      const host = this.surface().nativeElement;
      const board = this.board();
      const playerId = this.playerId();
      let cancelled = false;
      let renderer: RendererHandle | undefined;
      onCleanup(() => {
        cancelled = true;
        renderer?.destroy();
      });
      // Keep the Angular shell independent of the heavier GPU bundle.
      void this.loadRenderer()
        .then(async (loaded) => {
          if (cancelled) {
            loaded.destroy();
            return;
          }
          renderer = loaded;
          await renderer.mount(host, board, playerId);
        })
        .catch(() => {
          renderer?.destroy();
          if (!cancelled) this.error.set(true);
        });
    });
  }
}
