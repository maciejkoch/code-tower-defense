import { Graphics } from 'pixi.js';
import type { PlayerId } from '../engine/model';
import type { Projectile } from './projectiles';
import { APPEARANCE as look } from './appearance';

export function drawEffects(
  graphics: Graphics,
  projectiles: readonly Projectile[],
  playerId: PlayerId,
): void {
  graphics.clear();
  const position = (value: number) => look.padding + (value + 0.5) * look.cellSize;
  for (const projectile of projectiles) {
    const { attack, target, elapsedSeconds, flightSeconds } = projectile;
    if (attack.playerId !== playerId) continue;
    if (elapsedSeconds < flightSeconds) {
      const progress = elapsedSeconds / flightSeconds;
      const x = attack.from.x + (target.x - attack.from.x) * progress;
      const y = attack.from.y + (target.y - attack.from.y) * progress;
      if (attack.splashRadius === 0) {
        const angle = Math.atan2(target.y - attack.from.y, target.x - attack.from.x);
        const dx = Math.cos(angle),
          dy = Math.sin(angle);
        const px = position(x),
          py = position(y);
        graphics
          .moveTo(px - dx * 6, py - dy * 6)
          .lineTo(px, py)
          .stroke({ color: 0xd1b47d, width: 1.4 });
        graphics
          .poly([
            px + dx * 2,
            py + dy * 2,
            px - dx * 2 - dy * 1.5,
            py - dy * 2 + dx * 1.5,
            px - dx * 2 + dy * 1.5,
            py - dy * 2 - dx * 1.5,
          ])
          .fill(0xe1e3dc);
      } else {
        const height = Math.sin(progress * Math.PI) * look.cellSize * 0.55;
        graphics
          .ellipse(position(x), position(y) + 2, 3.5, 1.5)
          .fill({ color: 0x30291f, alpha: 0.25 });
        graphics
          .circle(position(x), position(y) - height, 3.3)
          .fill(0x969184)
          .stroke({ color: 0x4e4b43, width: 0.8 });
        graphics.circle(position(x) - 0.7, position(y) - height - 1, 1).fill(0xcac2ad);
      }
    } else if (attack.splashRadius > 0) {
      const progress = Math.min(
        1,
        (elapsedSeconds - flightSeconds) / look.projectiles.explosionSeconds,
      );
      const radius = attack.splashRadius * look.cellSize * (0.2 + progress * 0.8);
      graphics
        .circle(position(target.x), position(target.y), radius)
        .fill({ color: 0xd2b88a, alpha: 0.22 * (1 - progress) })
        .stroke({ color: 0xb39569, width: 1, alpha: 0.35 * (1 - progress) });
      for (let fragment = 0; fragment < 6; fragment++) {
        const angle = (fragment * Math.PI) / 3 + 0.3;
        graphics
          .circle(
            position(target.x) + Math.cos(angle) * radius * 0.65,
            position(target.y) + Math.sin(angle) * radius * 0.4 - Math.sin(progress * Math.PI) * 4,
            1.5 * (1 - progress),
          )
          .fill({ color: 0x84796a, alpha: 1 - progress });
      }
    }
  }
}
