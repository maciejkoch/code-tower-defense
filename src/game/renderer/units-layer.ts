import { Graphics } from 'pixi.js';
import type { MobState, PlayerId, TowerState } from '../engine/model';
import { APPEARANCE as look } from './appearance';

export function drawUnits(
  graphics: Graphics,
  mobs: readonly MobState[],
  towers: readonly TowerState[],
  playerId: PlayerId,
): void {
  graphics.clear();
  const { cellSize: size, padding } = look;
  for (const tower of towers) {
    const x = padding + (tower.x + 0.5) * size;
    const y = padding + (tower.y + 0.5) * size;
    const color = look.players[playerId];
    if (tower.type === 'basic') {
      graphics
        .roundRect(x - 12, y - 12, 24, 24, 4)
        .fill({ color, alpha: 0.25 })
        .stroke({ color, width: 2 });
      graphics.circle(x, y, 5).fill(color);
      graphics
        .moveTo(x, y)
        .lineTo(x, y - 10)
        .stroke({ color, width: 3 });
    } else {
      graphics
        .poly([x, y - 13, x + 13, y, x, y + 13, x - 13, y])
        .fill({ color, alpha: 0.25 })
        .stroke({ color, width: 2 });
      graphics.circle(x, y, 5).stroke({ color, width: 2 });
    }
    for (let level = 0; level < tower.level; level++) {
      graphics.rect(x - 8 + level * 6, y + 12, 4, 3).fill(color);
    }
  }
  for (const mob of mobs) {
    const x = padding + (mob.x + 0.5) * size;
    const y = padding + (mob.y + 0.5) * size;
    if (mob.type === 'heavy') graphics.rect(x - 9, y - 9, 18, 18);
    else graphics.circle(x, y, size * 0.22);
    graphics.fill(look.players[mob.ownerId]).stroke({ color: look.background, width: 2 });
    const ratio = Math.max(0, Math.min(1, mob.hp / mob.maxHp));
    graphics
      .rect(x - 11, y - 16, 22, 4)
      .fill(look.background)
      .stroke({ color: look.coordinates, width: 0.5 });
    graphics.rect(x - 10, y - 15, 20 * ratio, 2).fill(look.players[mob.ownerId]);
  }
}
