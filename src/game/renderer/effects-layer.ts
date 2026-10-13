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
  const color = look.players[playerId];
  const position = (value: number) => look.padding + (value + 0.5) * look.cellSize;
  for (const projectile of projectiles) {
    const { attack, target, elapsedSeconds, flightSeconds } = projectile;
    if (attack.playerId !== playerId) continue;
    if (elapsedSeconds < flightSeconds) {
      const progress = elapsedSeconds / flightSeconds;
      const x = attack.from.x + (target.x - attack.from.x) * progress;
      const y = attack.from.y + (target.y - attack.from.y) * progress;
      graphics.circle(position(x), position(y), look.projectiles.radius).fill(color);
      graphics.circle(position(x), position(y), 1.2).fill(0xffffff);
    } else if (attack.splashRadius > 0) {
      const progress = Math.min(
        1,
        (elapsedSeconds - flightSeconds) / look.projectiles.explosionSeconds,
      );
      const radius = attack.splashRadius * look.cellSize * (0.2 + progress * 0.8);
      graphics
        .circle(position(target.x), position(target.y), radius)
        .fill({ color, alpha: 0.12 * (1 - progress) })
        .stroke({ color, width: 2, alpha: 0.8 * (1 - progress) });
    }
  }
}
