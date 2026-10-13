import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import type { PlayerId, TowerType } from '../engine/model';
import type { TowerView } from './tower-animation';
import { CROSSBOW_ANCHORS, CROSSBOW_FRAMES } from './crossbow-frames';
import { CATAPULT_ANCHORS, CATAPULT_FRAMES } from './catapult-frames';
import { APPEARANCE as look } from './appearance';

/** Eight actual views of a rotating weapon; the stone base stays fixed. */
export class TowerLayer {
  readonly container = new Container();
  private readonly bases = new Graphics();
  private readonly bodies = new Container({ sortableChildren: true });
  private readonly levels = new Graphics();
  private readonly sprites = new Map<number, Sprite>();
  private readonly frames: Readonly<Record<TowerType, readonly Texture[]>>;
  private readonly anchors = { basic: CROSSBOW_ANCHORS, splash: CATAPULT_ANCHORS };

  constructor(atlases: Readonly<Record<TowerType, Texture>>) {
    const frames = (atlas: Texture, rectangles: readonly (readonly number[])[]) =>
      rectangles.map(
        ([x, y, width, height]) =>
          new Texture({ source: atlas.source, frame: new Rectangle(x, y, width, height) }),
      );
    this.frames = {
      basic: frames(atlases.basic, CROSSBOW_FRAMES),
      splash: frames(atlases.splash, CATAPULT_FRAMES),
    };
    this.container.addChild(this.bases, this.bodies, this.levels);
  }

  render(views: readonly TowerView[], playerId: PlayerId): void {
    const active = views;
    const ids = new Set(active.map((view) => view.tower.id));
    for (const [id, sprite] of this.sprites) {
      if (!ids.has(id)) {
        sprite.destroy();
        this.sprites.delete(id);
      }
    }
    this.bases.clear();
    this.levels.clear();
    for (const view of active) {
      const tower = view.tower;
      const frames = this.frames[tower.type];
      const index = view.direction + (view.firing ? 8 : 0);
      let sprite = this.sprites.get(tower.id);
      if (!sprite) {
        sprite = new Sprite(frames[index]);
        this.bodies.addChild(sprite);
        this.sprites.set(tower.id, sprite);
      }
      const x = look.padding + (tower.x + 0.5) * look.cellSize;
      const y = look.padding + (tower.y + 0.5) * look.cellSize;
      sprite.texture = frames[index];
      sprite.anchor.set(...this.anchors[tower.type][index]);
      sprite.scale.set(0.12);
      sprite.scale.y *= 1 - view.recoil * 0.025;
      sprite.position.set(x, y);
      sprite.zIndex = y;
      this.bases
        .ellipse(x, y + 8, 12, 4)
        .fill({ color: 0x000000, alpha: 0.25 })
        .stroke({ color: look.players[playerId], width: 1, alpha: 0.8 });
      for (let level = 0; level < tower.level; level++) {
        this.levels
          .rect(x - 8 + level * 6, y + 13, 4, 3)
          .fill(look.players[playerId])
          .stroke({ color: 0x332c22, width: 0.5 });
      }
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.sprites.clear();
    for (const frame of [...this.frames.basic, ...this.frames.splash]) frame.destroy(false);
  }
}
