import { Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { APPEARANCE as look } from './appearance';
import { CHOCHLIK_FRAMES } from './chochlik-frames';
import { GOLEM_FRAMES } from './golem-frames';
import type { MobType } from '../engine/model';
import type { MobView } from './mob-animation';

interface UnitSprite {
  readonly container: Container;
  readonly body: Sprite;
  readonly flash: Sprite;
}

/** Persistent sprites share an atlas; no per-frame GPU texture allocations. */
export class MobLayer {
  readonly container = new Container();
  private readonly shadows = new Graphics();
  private readonly bodies = new Container({ sortableChildren: true });
  private readonly health = new Graphics();
  private readonly sprites = new Map<number, UnitSprite>();
  private readonly frames: Readonly<Record<MobType, readonly Texture[]>>;

  constructor(atlases: Readonly<Record<MobType, Texture>>) {
    const frames = (atlas: Texture, rectangles: readonly (readonly number[])[]) =>
      rectangles.map(
        ([x, y, width, height]) =>
          new Texture({ source: atlas.source, frame: new Rectangle(x, y, width, height) }),
      );
    this.frames = {
      basic: frames(atlases.basic, CHOCHLIK_FRAMES),
      heavy: frames(atlases.heavy, GOLEM_FRAMES),
    };
    this.container.addChild(this.shadows, this.bodies, this.health);
  }

  render(views: readonly MobView[]): void {
    const present = new Set(views.map((view) => view.id));
    for (const [id, unit] of this.sprites) {
      if (!present.has(id)) {
        unit.container.destroy({ children: true });
        this.sprites.delete(id);
      }
    }
    this.shadows.clear();
    this.health.clear();
    for (const view of views) {
      const texture = this.frames[view.type][view.row * 4 + view.frame];
      const style = look.mobSprites[view.type];
      let unit = this.sprites.get(view.id);
      if (!unit) {
        const container = new Container();
        const body = new Sprite(texture);
        const flash = new Sprite({ texture, blendMode: 'add' });
        body.anchor.set(0.5, 0.8);
        flash.anchor.set(0.5, 0.8);
        container.addChild(body, flash);
        this.bodies.addChild(container);
        unit = { container, body, flash };
        this.sprites.set(view.id, unit);
      }
      const x = look.padding + (view.x + 0.5) * look.cellSize + ((view.id % 7) - 3) * 2;
      const y = look.padding + (view.y + 0.5) * look.cellSize + (((view.id * 3) % 7) - 3) * 1.2;
      const color = look.players[view.ownerId];
      unit.container.position.set(x, y);
      unit.container.zIndex = y;
      unit.container.alpha = view.alpha;
      unit.body.texture = texture;
      unit.flash.texture = texture;
      unit.body.scale.set(style.textureScale * view.scale);
      unit.flash.scale.copyFrom(unit.body.scale);
      unit.flash.alpha = view.flash * 0.8;
      this.shadows
        .ellipse(x, y + 3, style.shadowWidth * view.scale, 3 * view.scale)
        .fill({ color: 0x000000, alpha: view.alpha * 0.35 })
        .stroke({ color, width: 1, alpha: view.alpha * 0.65 });
      if (!view.departing) {
        this.health
          .rect(x - 10, y - style.healthOffset, 20, 3)
          .fill(look.background)
          .stroke({ color: look.coordinates, width: 0.5 });
        this.health.rect(x - 9, y - style.healthOffset + 1, 18 * view.health, 1.5).fill(color);
      }
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.sprites.clear();
    // Frame textures belong to this board, the cached atlas source is shared by both boards.
    for (const texture of [...this.frames.basic, ...this.frames.heavy]) texture.destroy(false);
  }
}
