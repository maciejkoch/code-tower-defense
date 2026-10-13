import type { MobState, MobType, PlayerId } from '../engine/model';
import { APPEARANCE } from './appearance';

export interface MobView {
  readonly id: number;
  readonly type: MobType;
  readonly ownerId: PlayerId;
  readonly x: number;
  readonly y: number;
  readonly row: number;
  readonly frame: number;
  readonly alpha: number;
  readonly scale: number;
  readonly flash: number;
  readonly health: number;
  readonly departing: boolean;
}

interface Track {
  mob: MobState;
  row: number;
  moving: boolean;
  walkSeconds: number;
  sampleAge: number;
  spawnAge: number;
  hitRemaining: number;
  fadeAge: number | null;
}

/** Visual time only. Mob snapshots and all game rules remain untouched. */
export class MobAnimation {
  private readonly tracks = new Map<number, Track>();
  private snapshot: readonly MobState[] | undefined;

  get active(): boolean {
    return this.tracks.size > 0;
  }

  receive(mobs: readonly MobState[]): void {
    if (mobs === this.snapshot) return;
    this.snapshot = mobs;
    const present = new Set<number>();
    for (const mob of mobs) {
      present.add(mob.id);
      const track = this.tracks.get(mob.id);
      const edgeX = mob.to.x - mob.from.x;
      const edgeY = mob.to.y - mob.from.y;
      const dx = edgeX || edgeY ? edgeX : mob.x - (track?.mob.x ?? mob.x);
      const dy = edgeX || edgeY ? edgeY : mob.y - (track?.mob.y ?? mob.y);
      const moving = Math.abs(dx) + Math.abs(dy) > 1e-7;
      const row = moving
        ? Math.abs(dx) >= Math.abs(dy)
          ? dx >= 0
            ? 0
            : 2
          : dy >= 0
            ? 1
            : 3
        : (track?.row ?? 0);
      if (track) {
        if (mob.hp < track.mob.hp) track.hitRemaining = APPEARANCE.mobAnimations.hitSeconds;
        track.mob = mob;
        track.row = row;
        track.moving = moving;
        track.sampleAge = 0;
        track.fadeAge = null;
      } else {
        this.tracks.set(mob.id, {
          mob,
          row,
          moving,
          walkSeconds: (mob.id % 4) / 8,
          sampleAge: 0,
          spawnAge: 0,
          hitRemaining: 0,
          fadeAge: null,
        });
      }
    }
    for (const [id, track] of this.tracks) {
      if (!present.has(id) && track.fadeAge === null) track.fadeAge = 0;
    }
  }

  advance(seconds: number): void {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    for (const [id, track] of this.tracks) {
      track.hitRemaining = Math.max(0, track.hitRemaining - seconds);
      if (track.fadeAge !== null) {
        track.fadeAge += seconds;
        if (track.fadeAge >= APPEARANCE.mobAnimations.fadeSeconds) this.tracks.delete(id);
      } else {
        track.sampleAge += seconds;
        track.spawnAge += seconds;
        if (track.moving) track.walkSeconds += seconds;
      }
    }
  }

  get views(): readonly MobView[] {
    return [...this.tracks.values()].map((track) => {
      const { mob } = track;
      const dx = mob.to.x - mob.from.x;
      const dy = mob.to.y - mob.from.y;
      // Smooth between simulation samples, stopping at the next cell center.
      const distance = Math.min(
        Math.hypot(mob.to.x - mob.x, mob.to.y - mob.y),
        mob.speed * Math.min(track.sampleAge, APPEARANCE.mobAnimations.maxPredictionSeconds),
      );
      const fade = (track.fadeAge ?? 0) / APPEARANCE.mobAnimations.fadeSeconds;
      return {
        id: mob.id,
        type: mob.type,
        ownerId: mob.ownerId,
        x: mob.x + dx * distance,
        y: mob.y + dy * distance,
        row: track.row,
        frame: track.moving ? Math.floor(track.walkSeconds * mob.speed * 4 + 1e-7) % 4 : 0,
        alpha:
          (0.5 + 0.5 * Math.min(1, track.spawnAge / APPEARANCE.mobAnimations.spawnSeconds)) *
          (1 - fade),
        scale: 1 - fade * 0.25,
        flash: track.hitRemaining / APPEARANCE.mobAnimations.hitSeconds,
        health: Math.max(0, Math.min(1, mob.hp / mob.maxHp)),
        departing: track.fadeAge !== null,
      };
    });
  }

  reset(): void {
    this.tracks.clear();
    this.snapshot = undefined;
  }
}
