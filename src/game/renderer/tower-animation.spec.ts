import { describe, expect, it } from 'vitest';
import type { MobState, TowerState } from '../engine/model';
import type { AttackEvent } from '../engine/events';
import { TowerAnimation } from './tower-animation';

const tower: TowerState = Object.freeze({
  id: 1,
  type: 'basic',
  level: 1,
  x: 4,
  y: 6,
  damage: 15,
  range: 3,
  attackInterval: 0.5,
  cooldownRemaining: 0,
  totalSpent: 50,
});
const mob: MobState = Object.freeze({
  id: 2,
  type: 'basic',
  ownerId: 2,
  level: 1,
  x: 6,
  y: 6,
  hp: 40,
  maxHp: 40,
  speed: 2,
  reward: 1,
  remainingDistance: 5,
  from: { x: 6, y: 6 },
  to: { x: 7, y: 6 },
  progress: 0,
});
const attack: AttackEvent = Object.freeze({
  tick: 5,
  playerId: 1,
  towerId: 1,
  targetMobId: 2,
  from: { x: 4, y: 6 },
  target: { x: 6, y: 6 },
  splashRadius: 0,
});

describe('tower presentation', () => {
  it('keeps the catapult arm released longer than the crossbow recoil', () => {
    const animation = new TowerAnimation();
    const catapult = { ...tower, type: 'splash' as const };
    animation.receive([catapult], [mob], [{ ...attack, splashRadius: 1.5 }]);
    animation.advance(0.2);
    expect(animation.views[0].firing).toBe(true);
    animation.advance(0.2);
    expect(animation.views[0].firing).toBe(false);
  });
  it('uses eight aiming directions, with no firing animation until the engine sends a shot', () => {
    for (let direction = 0; direction < 8; direction++) {
      const animation = new TowerAnimation();
      const angle = (direction * Math.PI) / 4;
      animation.receive(
        [tower],
        [{ ...mob, x: tower.x + Math.cos(angle), y: tower.y + Math.sin(angle) }],
        [],
      );
      expect(animation.views[0]).toMatchObject({ direction, firing: false });
    }
    expect(tower.cooldownRemaining).toBe(0);
    expect(mob.hp).toBe(40);
  });

  it('uses the actual shot direction even when its target was already removed', () => {
    const animation = new TowerAnimation();
    animation.receive([tower], [], [attack]);
    expect(animation.views[0]).toMatchObject({ direction: 0, firing: true, recoil: 1 });
  });

  it('deduplicates repeated shot events and returns to the loaded pose', () => {
    const animation = new TowerAnimation();
    animation.receive([tower], [mob], [attack]);
    animation.advance(0.09);
    animation.receive([tower], [mob], [attack]);
    expect(animation.views[0].recoil).toBeCloseTo(0.5);
    animation.advance(0.1);
    expect(animation.views[0].firing).toBe(false);
  });

  it('freezes recoil while paused and scales its progress with playback speed', () => {
    const normal = new TowerAnimation();
    const fast = new TowerAnimation();
    normal.receive([tower], [mob], [attack]);
    fast.receive([tower], [mob], [attack]);
    const paused = normal.views;
    normal.advance(0);
    normal.advance(-1);
    expect(normal.views).toEqual(paused);
    normal.advance(0.02);
    fast.advance(0.02 * 4);
    expect(fast.views[0].recoil).toBeLessThan(normal.views[0].recoil);
  });

  it('removes sold towers and accepts early shot ticks after a reset', () => {
    const animation = new TowerAnimation();
    animation.receive([tower], [mob], [{ ...attack, tick: 100 }]);
    animation.receive([], [mob], []);
    expect(animation.views).toEqual([]);
    animation.reset();
    animation.receive([tower], [mob], [attack]);
    expect(animation.views[0].firing).toBe(true);
  });
});
