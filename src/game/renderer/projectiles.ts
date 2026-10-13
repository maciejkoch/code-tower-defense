import type { AttackEvent } from '../engine/events';
import type { Cell } from '../config/game-config';
import type { MobState } from '../engine/model';
import { APPEARANCE } from './appearance';

export interface Projectile {
  readonly attack: AttackEvent;
  readonly elapsedSeconds: number;
  readonly flightSeconds: number;
  readonly target: Cell;
}

/** Presentation time only: never modifies units, health or the simulation. */
export class ProjectileAnimation {
  private flights: readonly Projectile[] = [];
  private latestTick = -1;
  private readonly seen = new Set<string>();

  get projectiles(): readonly Projectile[] {
    return this.flights;
  }
  get active(): boolean {
    return this.flights.length > 0;
  }

  reset(): void {
    this.flights = [];
    this.latestTick = -1;
    this.seen.clear();
  }

  receive(attacks: readonly AttackEvent[]): void {
    const additions: Projectile[] = [];
    for (const attack of attacks) {
      if (attack.tick < this.latestTick) continue;
      if (attack.tick > this.latestTick) {
        this.latestTick = attack.tick;
        this.seen.clear();
      }
      const key = `${attack.playerId}:${attack.towerId}`;
      if (this.seen.has(key)) continue;
      this.seen.add(key);
      const distance = Math.hypot(attack.from.x - attack.target.x, attack.from.y - attack.target.y);
      additions.push({
        attack,
        elapsedSeconds: 0,
        target: attack.target,
        flightSeconds: Math.max(
          APPEARANCE.projectiles.minFlightSeconds,
          distance / APPEARANCE.projectiles.speedCellsPerSecond,
        ),
      });
    }
    this.flights = [...this.flights, ...additions];
  }

  trackTargets(mobs: readonly MobState[]): void {
    this.flights = this.flights.map((projectile) => {
      if (projectile.elapsedSeconds >= projectile.flightSeconds) return projectile;
      const target = mobs.find((mob) => mob.id === projectile.attack.targetMobId);
      return target ? { ...projectile, target: { x: target.x, y: target.y } } : projectile;
    });
  }

  advance(seconds: number): void {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    this.flights = this.flights
      .map((projectile) => ({ ...projectile, elapsedSeconds: projectile.elapsedSeconds + seconds }))
      .filter(
        (projectile) =>
          projectile.elapsedSeconds <
          projectile.flightSeconds +
            (projectile.attack.splashRadius > 0 ? APPEARANCE.projectiles.explosionSeconds : 0),
      );
  }
}
