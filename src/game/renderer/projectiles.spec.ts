import { describe, expect, it } from 'vitest';
import type { AttackEvent } from '../engine/events';
import type { MobState } from '../engine/model';
import { ProjectileAnimation } from './projectiles';
import { APPEARANCE } from './appearance';

const attack: AttackEvent = {
  tick: 5,
  playerId: 1,
  towerId: 1,
  targetMobId: 2,
  from: { x: 4, y: 6 },
  target: { x: 7, y: 6 },
  splashRadius: 0,
};

describe('projectile presentation', () => {
  it('accepts early ticks again after resetting a match', () => {
    const animation = new ProjectileAnimation();
    animation.receive([{ ...attack, tick: 100 }]);
    animation.reset();
    expect(animation.active).toBe(false);
    animation.receive([attack]);
    expect(animation.projectiles).toHaveLength(1);
    expect(animation.projectiles[0].attack.tick).toBe(5);
  });
  it('deduplicates repeated events and preserves active flights when the next shot arrives', () => {
    const animation = new ProjectileAnimation();
    animation.receive([attack]);
    animation.advance(0.1);
    animation.receive([attack]);
    expect(animation.projectiles).toHaveLength(1);
    expect(animation.projectiles[0].elapsedSeconds).toBe(0.1);
    animation.receive([{ ...attack, tick: 10 }]);
    expect(animation.projectiles).toHaveLength(2);
    expect(animation.projectiles[0].elapsedSeconds).toBe(0.1);
  });

  it('removes the basic projectile at impact and retains splash until its explosion fades', () => {
    const basic = new ProjectileAnimation();
    basic.receive([attack]);
    basic.advance(basic.projectiles[0].flightSeconds + 0.001);
    expect(basic.active).toBe(false);
    const splash = new ProjectileAnimation();
    splash.receive([{ ...attack, splashRadius: 1.5 }]);
    splash.advance(splash.projectiles[0].flightSeconds + 0.001);
    expect(splash.active).toBe(true);
    splash.advance(APPEARANCE.projectiles.explosionSeconds);
    expect(splash.active).toBe(false);
  });

  it('freezes with no elapsed time and supports the selected playback speed', () => {
    const slow = new ProjectileAnimation();
    const fast = new ProjectileAnimation();
    slow.receive([attack]);
    fast.receive([attack]);
    const paused = slow.projectiles;
    slow.advance(0);
    expect(slow.projectiles).toBe(paused);
    slow.advance(0.02 * 0.5);
    fast.advance(0.02 * 4);
    expect(slow.projectiles[0].elapsedSeconds).toBe(0.01);
    expect(fast.projectiles[0].elapsedSeconds).toBe(0.08);
  });

  it('tracks a surviving target, locks the explosion point and never changes game events or units', () => {
    const animation = new ProjectileAnimation();
    const event = { ...attack, splashRadius: 1.5 };
    const cell = { x: 8, y: 6 };
    const mob: MobState = {
      id: 2,
      ownerId: 2,
      type: 'basic',
      level: 1,
      x: 8,
      y: 6,
      hp: 32,
      maxHp: 40,
      speed: 2,
      reward: 5,
      remainingDistance: 7,
      from: cell,
      to: cell,
      progress: 0,
    };
    animation.receive([event]);
    animation.trackTargets([mob]);
    expect(animation.projectiles[0].target).toEqual(cell);
    animation.advance(animation.projectiles[0].flightSeconds);
    animation.trackTargets([{ ...mob, x: 9 }]);
    expect(animation.projectiles[0].target).toEqual(cell);
    expect(event.target).toEqual({ x: 7, y: 6 });
    expect(mob.hp).toBe(32);
  });
});
