import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import type { BoardConfig, Cell } from '../config/game-config';
import { APPEARANCE as look } from './appearance';
import { GATE_FRAME } from './board-art';

/** Static grass tiles, a route supplied by the engine, and presentation-only torchlight. */
export class BoardSurface {
  readonly container = new Container();
  private readonly tiles: Sprite[] = [];
  private readonly frames: Texture[];
  private readonly flames = new Graphics();
  private seconds = 0;

  constructor(
    private readonly board: BoardConfig,
    terrain: Texture,
    gateAtlas: Texture,
  ) {
    const halfWidth = terrain.width / 2;
    const halfHeight = terrain.height / 2;
    this.frames = [0, 1, 2, 3].map(
      (index) =>
        new Texture({
          source: terrain.source,
          frame: new Rectangle(
            (index % 2) * halfWidth,
            Math.floor(index / 2) * halfHeight,
            halfWidth,
            halfHeight,
          ),
        }),
    );
    const grid = new Graphics();
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const tile = new Sprite(this.frames[(x * 17 + y * 13) % 5 === 0 ? 1 : 0]);
        tile.position.set(look.padding + x * look.cellSize, look.padding + y * look.cellSize);
        tile.width = tile.height = look.cellSize;
        this.tiles.push(tile);
        this.container.addChild(tile);
        grid
          .rect(tile.x, tile.y, look.cellSize, look.cellSize)
          .stroke({ color: 0x344224, width: 0.5, alpha: 0.28 });
      }
    }
    this.container.addChild(grid);
    const gateFrame = new Texture({
      source: gateAtlas.source,
      frame: new Rectangle(...GATE_FRAME),
    });
    this.frames.push(gateFrame);
    const gate = new Sprite(gateFrame);
    gate.anchor.set(0.5, 0.8);
    gate.width = 44;
    gate.scale.y = gate.scale.x;
    gate.position.set(this.position(board.base.x), this.position(board.base.y));
    this.container.addChild(gate, this.flames);
    this.drawFlames();
  }

  setRoute(cells: readonly Cell[]): void {
    const route = new Set(cells.map((cell) => cell.y * this.board.width + cell.x));
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        const index = y * this.board.width + x;
        const marker =
          (x === this.board.entry.x && y === this.board.entry.y) ||
          (x === this.board.base.x && y === this.board.base.y);
        this.tiles[index].texture =
          this.frames[marker ? 3 : route.has(index) ? 2 : (x * 17 + y * 13) % 5 === 0 ? 1 : 0];
        this.tiles[index].tint = marker || route.has(index) ? 0xffffff : 0xa4b69e;
      }
    }
  }

  advance(seconds: number): void {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    this.seconds += seconds;
    this.drawFlames();
  }

  reset(): void {
    this.seconds = 0;
    this.drawFlames();
  }

  private position(value: number): number {
    return look.padding + (value + 0.5) * look.cellSize;
  }

  private drawFlames(): void {
    this.flames.clear();
    for (const side of [-1, 1]) {
      const x = this.position(this.board.base.x) + side * 16;
      const y = this.position(this.board.base.y) - 6;
      const flicker = 0.5 + 0.5 * Math.sin(this.seconds * 17 + side * 2);
      this.flames.circle(x, y - 2, 5).fill({ color: 0xffb347, alpha: 0.12 + flicker * 0.1 });
      this.flames
        .poly([x - 1.6, y, x + Math.sin(this.seconds * 13) * 0.7, y - 3 - flicker * 2, x + 1.6, y])
        .fill(0xf79937);
      this.flames.ellipse(x, y - 1, 0.7, 1.4).fill(0xffe6a0);
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
    for (const frame of this.frames) frame.destroy(false);
  }
}
