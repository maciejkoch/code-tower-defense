import { Application, Graphics, Text } from 'pixi.js';
import type { BoardConfig } from '../config/game-config';
import type { PlayerId } from '../engine/model';
import { APPEARANCE as look } from './appearance';

/** Owns GPU resources only. It never changes the match or runs simulation steps. */
export class BoardRenderer {
  private readonly app = new Application();
  private initialized = false;
  private disposed = false;

  async mount(host: HTMLElement, board: BoardConfig, playerId: PlayerId): Promise<void> {
    const { cellSize: size, padding } = look;
    await this.app.init({
      width: board.width * size + padding * 2,
      height: board.height * size + padding * 2,
      background: look.background,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      antialias: true,
      autoStart: false,
      preference: 'webgl',
    });
    this.initialized = true;
    // Angular can destroy the view while GPU initialization is still pending.
    if (this.disposed) {
      this.release();
      return;
    }

    const canvas = this.app.canvas;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.display = 'block';
    host.append(canvas);

    const grid = new Graphics();
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        grid
          .rect(padding + x * size, padding + y * size, size, size)
          .fill((x + y) % 2 ? look.alternateCell : look.cell)
          .stroke({ color: look.grid, width: 0.5 });
      }
    }
    this.app.stage.addChild(grid);

    for (let x = 0; x < board.width; x++) {
      this.label(String(x), padding + (x + 0.5) * size, padding / 2);
    }
    for (let y = 0; y < board.height; y++) {
      this.label(String(y), padding / 2, padding + (y + 0.5) * size);
    }

    const markers = new Graphics();
    const entryX = padding + (board.entry.x + 0.5) * size;
    const entryY = padding + (board.entry.y + 0.5) * size;
    const baseX = padding + (board.base.x + 0.5) * size;
    const baseY = padding + (board.base.y + 0.5) * size;
    markers
      .rect(entryX - size / 2 + 2, entryY - size / 2 + 2, size - 4, size - 4)
      .fill({ color: look.entry, alpha: 0.12 });
    markers
      .moveTo(entryX - 9, entryY)
      .lineTo(entryX + 8, entryY)
      .moveTo(entryX + 1, entryY - 7)
      .lineTo(entryX + 8, entryY)
      .lineTo(entryX + 1, entryY + 7)
      .stroke({ color: look.entry, width: 2 });
    markers
      .rect(baseX - size / 2 + 2, baseY - size / 2 + 2, size - 4, size - 4)
      .fill({ color: look.players[playerId], alpha: 0.15 });
    markers
      .poly([
        baseX - 9,
        baseY - 10,
        baseX + 9,
        baseY - 10,
        baseX + 9,
        baseY + 2,
        baseX,
        baseY + 11,
        baseX - 9,
        baseY + 2,
      ])
      .stroke({ color: look.players[playerId], width: 2 });
    this.app.stage.addChild(markers);
    this.app.render();
  }

  destroy(): void {
    this.disposed = true;
    if (this.initialized) this.release();
  }

  private release(): void {
    this.app.destroy(true, { children: true });
    this.initialized = false;
  }

  private label(text: string, x: number, y: number): void {
    const label = new Text({
      text,
      style: {
        fontFamily: 'monospace',
        fontSize: 10,
        fill: look.coordinates,
      },
    });
    label.anchor.set(0.5);
    label.position.set(x, y);
    this.app.stage.addChild(label);
  }
}
