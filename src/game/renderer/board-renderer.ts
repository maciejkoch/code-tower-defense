import { Application, Graphics, Text } from 'pixi.js';
import { createDistanceField, nextCell, sameCell } from '../engine/pathfinding';
import type { BoardConfig } from '../config/game-config';
import type { MobState, PlayerId, TowerState } from '../engine/model';
import type { AttackEvent } from '../engine/events';
import { ProjectileAnimation } from './projectiles';
import type { PlaybackSpeed } from '../runtime/playback';
import { drawEffects } from './effects-layer';
import { APPEARANCE as look } from './appearance';
import { MobAnimation } from './mob-animation';
import { MobLayer } from './mob-layer';
import { BoardSurface } from './board-surface';
import { loadArt } from './art-assets';
import { TowerAnimation } from './tower-animation';
import { TowerLayer } from './tower-layer';

/** Owns GPU resources only. It never changes the match or runs simulation steps. */
export class BoardRenderer {
  private readonly app = new Application();
  private initialized = false;
  private disposed = false;
  private readonly route = new Graphics();
  private board: BoardConfig | undefined;
  private routeLayout: string | null = null;
  private readonly effects = new Graphics();
  private playerId: PlayerId = 1;
  private readonly animation = new ProjectileAnimation();
  private readonly mobAnimation = new MobAnimation();
  private mobLayer: MobLayer | undefined;
  private surface: BoardSurface | undefined;
  private readonly towerAnimation = new TowerAnimation();
  private towerLayer: TowerLayer | undefined;
  private running = false;
  private speed: PlaybackSpeed = 1;

  async mount(host: HTMLElement, board: BoardConfig, playerId: PlayerId): Promise<void> {
    this.playerId = playerId;
    this.board = board;
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

    const [basic, heavy] = await Promise.all(
      ['chochlik', 'golem'].map((name) => loadArt(`mobs/${name}/walk.png`)),
    );
    if (this.disposed) return;
    this.mobLayer = new MobLayer({ basic, heavy });
    const [terrain, gate] = await Promise.all(
      ['terrain', 'gate'].map((name) => loadArt(`board/${name}.png`)),
    );
    if (this.disposed) return;
    this.surface = new BoardSurface(board, terrain, gate);
    const [crossbow, catapult] = await Promise.all(
      ['crossbow', 'catapult'].map((name) => loadArt(`towers/${name}.png`)),
    );
    if (this.disposed) return;
    this.towerLayer = new TowerLayer({ basic: crossbow, splash: catapult });

    const canvas = this.app.canvas;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.display = 'block';
    host.append(canvas);

    this.app.stage.addChild(this.surface.container);
    this.app.stage.addChild(this.route);

    for (let x = 0; x < board.width; x++) {
      this.label(String(x), padding + (x + 0.5) * size, padding / 2);
    }
    for (let y = 0; y < board.height; y++) {
      this.label(String(y), padding / 2, padding + (y + 0.5) * size);
    }

    const markers = new Graphics();
    const entryX = padding + (board.entry.x + 0.5) * size;
    const entryY = padding + (board.entry.y + 0.5) * size;
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
    this.app.stage.addChild(markers);
    this.app.stage.addChild(this.towerLayer.container);
    this.app.stage.addChild(this.mobLayer.container);
    this.app.stage.addChild(this.effects);
    this.app.ticker.add((ticker) => {
      this.animation.advance((ticker.deltaMS / 1000) * this.speed);
      this.mobAnimation.advance((ticker.deltaMS / 1000) * this.speed);
      this.surface?.advance((ticker.deltaMS / 1000) * this.speed);
      this.towerAnimation.advance((ticker.deltaMS / 1000) * this.speed);
      this.towerLayer?.render(this.towerAnimation.views, this.playerId);
      this.mobLayer?.render(this.mobAnimation.views);
      drawEffects(this.effects, this.animation.projectiles, this.playerId);
    });
    this.app.render();
  }

  drawUnits(
    mobs: readonly MobState[],
    towers: readonly TowerState[],
    attacks: readonly AttackEvent[],
  ): void {
    if (!this.initialized || this.disposed) return;
    if (!this.running && mobs.length === 0 && towers.length === 0) {
      this.mobAnimation.reset();
      this.animation.reset();
      this.surface?.reset();
      this.towerAnimation.reset();
    }
    this.drawRoute(towers);
    this.mobAnimation.receive(mobs);
    this.mobLayer?.render(this.mobAnimation.views);
    this.towerAnimation.receive(
      towers,
      mobs,
      attacks.filter((attack) => attack.playerId === this.playerId),
    );
    this.towerLayer?.render(this.towerAnimation.views, this.playerId);
    this.animation.receive(attacks.filter((attack) => attack.playerId === this.playerId));
    this.animation.trackTargets(mobs);
    drawEffects(this.effects, this.animation.projectiles, this.playerId);
    this.updateTicker();
    this.app.render();
  }

  private drawRoute(towers: readonly TowerState[]): void {
    if (!this.board) return;
    const layout = towers.map((tower) => `${tower.x},${tower.y}`).join(';');
    if (layout === this.routeLayout) return;
    this.routeLayout = layout;
    const board = this.board;
    const field = createDistanceField(board, towers);
    const position = (value: number) => look.padding + (value + 0.5) * look.cellSize;
    this.route.clear().moveTo(position(board.entry.x), position(board.entry.y));
    let cell = board.entry;
    const cells = [cell];
    for (let i = 0; i < board.width * board.height && !sameCell(cell, board.base); i++) {
      const next = nextCell(board, field, cell);
      if (!next) break;
      this.route.lineTo(position(next.x), position(next.y));
      cell = next;
      cells.push(cell);
    }
    this.surface?.setRoute(cells);
    this.route.stroke({ color: 0x6c563a, width: 1, alpha: 0.2 });
  }

  setPlayback(running: boolean, speed: PlaybackSpeed): void {
    this.running = running;
    this.speed = speed;
    this.updateTicker();
  }

  private updateTicker(): void {
    if (!this.initialized || this.disposed) return;
    if (this.running) this.app.start();
    else this.app.stop();
  }

  destroy(): void {
    this.disposed = true;
    if (this.initialized) this.release();
  }

  private release(): void {
    this.mobLayer?.destroy();
    this.mobLayer = undefined;
    this.surface?.destroy();
    this.surface = undefined;
    this.mobAnimation.reset();
    this.towerLayer?.destroy();
    this.towerLayer = undefined;
    this.towerAnimation.reset();
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
