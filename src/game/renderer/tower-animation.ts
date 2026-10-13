import type { AttackEvent } from '../engine/events';
import type { MobState, TowerState } from '../engine/model';
import { selectTarget } from '../engine/combat';

export interface TowerView {
  readonly tower: TowerState;
  readonly direction: number;
  readonly firing: boolean;
  readonly recoil: number;
}

interface Track {
  tower: TowerState;
  angle: number;
  aim: number;
  shotRemaining: number;
}

export const SHOT_SECONDS = { basic: 0.18, splash: 0.36 } as const;

/** Aiming and recoil only; actual attacks always come from engine events. */
export class TowerAnimation {
  private readonly tracks = new Map<number, Track>();
  private latestTick = -1;
  private readonly seen = new Set<string>();

  receive(
    towers: readonly TowerState[],
    mobs: readonly MobState[],
    attacks: readonly AttackEvent[],
  ): void {
    const ids = new Set(towers.map((tower) => tower.id));
    for (const id of this.tracks.keys()) if (!ids.has(id)) this.tracks.delete(id);
    for (const tower of towers) {
      const target = selectTarget(tower, mobs);
      const track = this.tracks.get(tower.id);
      const aim = target
        ? Math.atan2(target.y - tower.y, target.x - tower.x)
        : (track?.aim ?? -Math.PI / 2);
      if (track) {
        track.tower = tower;
        track.aim = aim;
      } else this.tracks.set(tower.id, { tower, angle: aim, aim, shotRemaining: 0 });
    }
    for (const attack of attacks) {
      if (attack.tick < this.latestTick) continue;
      if (attack.tick > this.latestTick) {
        this.latestTick = attack.tick;
        this.seen.clear();
      }
      const key = `${attack.playerId}:${attack.towerId}`;
      if (this.seen.has(key)) continue;
      this.seen.add(key);
      const track = this.tracks.get(attack.towerId);
      if (!track) continue;
      track.angle = track.aim = Math.atan2(
        attack.target.y - attack.from.y,
        attack.target.x - attack.from.x,
      );
      track.shotRemaining = SHOT_SECONDS[track.tower.type];
    }
  }

  advance(seconds: number): void {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    for (const track of this.tracks.values()) {
      track.shotRemaining = Math.max(0, track.shotRemaining - seconds);
      if (track.shotRemaining > 0) continue;
      const difference = Math.atan2(
        Math.sin(track.aim - track.angle),
        Math.cos(track.aim - track.angle),
      );
      const limit = Math.PI * 4 * seconds;
      track.angle += Math.max(-limit, Math.min(limit, difference));
    }
  }

  get views(): readonly TowerView[] {
    return [...this.tracks.values()].map((track) => ({
      tower: track.tower,
      direction: ((Math.round(track.angle / (Math.PI / 4)) % 8) + 8) % 8,
      firing: track.shotRemaining > 0,
      recoil: track.shotRemaining / SHOT_SECONDS[track.tower.type],
    }));
  }

  reset(): void {
    this.tracks.clear();
    this.latestTick = -1;
    this.seen.clear();
  }
}
