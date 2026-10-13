import { describe, expect, it } from 'vitest';
import type { MobState } from '../engine/model';
import { MobAnimation } from './mob-animation';

const mob: MobState = {
  id: 4,
  ownerId: 2,
  type: 'basic',
  level: 1,
  x: 2.2,
  y: 6,
  from: { x: 2, y: 6 },
  to: { x: 3, y: 6 },
  progress: 0.2,
  hp: 40,
  maxHp: 40,
  speed: 2,
  reward: 1,
  remainingDistance: 12.8,
};

describe('mob presentation', () => {
  it('selects all four facing directions from the current path segment', () => {
    const animation = new MobAnimation();
    for (const [to, row] of [
      [{ x: 3, y: 6 }, 0],
      [{ x: 2, y: 7 }, 1],
      [{ x: 1, y: 6 }, 2],
      [{ x: 2, y: 5 }, 3],
    ] as const) {
      animation.receive([{ ...mob, to }]);
      expect(animation.views[0].row).toBe(row);
    }
    animation.receive([{ ...mob, x: 2, from: mob.from, to: mob.from }]);
    expect(animation.views[0].row).toBe(2); // Last observed movement was leftward.
  });

  it('plays the gait at playback speed and stays still when time is paused', () => {
    const animation = new MobAnimation();
    animation.receive([mob]);
    animation.advance(0.125);
    expect(animation.views[0].frame).toBe(1);
    const paused = animation.views;
    animation.advance(0);
    animation.advance(Number.NaN);
    expect(animation.views).toEqual(paused);
    const faster = new MobAnimation();
    faster.receive([mob]);
    faster.advance(0.125 * 2);
    expect(faster.views[0].frame).toBe(2);
    animation.advance(0.125);
    expect(faster.views).toEqual(animation.views);
  });

  it('smooths motion without passing the next cell or mutating the snapshot', () => {
    const animation = new MobAnimation();
    const nearCorner = Object.freeze({ ...mob, x: 2.95, progress: 0.95 });
    animation.receive([nearCorner]);
    animation.advance(0.1);
    expect(animation.views[0].x).toBe(3);
    animation.advance(10);
    expect(animation.views[0].x).toBe(3);
    expect(nearCorner.x).toBe(2.95);
    expect(nearCorner.hp).toBe(40);
  });

  it('flashes once when health falls, including splash victims, then returns to normal', () => {
    const animation = new MobAnimation();
    animation.receive([mob]);
    const damaged = [{ ...mob, hp: 25 }];
    animation.receive(damaged);
    expect(animation.views[0].flash).toBe(1);
    expect(animation.views[0].health).toBe(0.625);
    animation.advance(0.05);
    animation.receive(damaged);
    expect(animation.views[0].flash).toBeCloseTo(0.5);
    animation.receive([...damaged]);
    expect(animation.views[0].flash).toBeCloseTo(0.5);
    animation.advance(0.1);
    expect(animation.views[0].flash).toBe(0);
  });

  it('fades a removed mob once, releases it and clears everything on reset', () => {
    const animation = new MobAnimation();
    animation.receive([mob]);
    animation.advance(0.2);
    animation.receive([]);
    animation.advance(0.1);
    animation.receive([]);
    expect(animation.views[0]).toMatchObject({ alpha: 0.5, scale: 0.875, departing: true });
    animation.advance(0.1);
    expect(animation.active).toBe(false);
    animation.receive([mob]);
    animation.reset();
    expect(animation.views).toEqual([]);
    animation.receive([mob]);
    expect(animation.views[0]).toMatchObject({ frame: 0, flash: 0, departing: false });
  });

  it('animates heavy mobs at their slower speed and holds a stationary mob idle', () => {
    const animation = new MobAnimation();
    animation.receive([{ ...mob, type: 'heavy', speed: 1 }]);
    animation.advance(0.25);
    expect(animation.views[0]).toMatchObject({ type: 'heavy', frame: 1 });
    animation.reset();
    animation.receive([{ ...mob, from: mob.to, to: mob.to }]);
    animation.advance(0.3);
    expect(animation.views[0].frame).toBe(0);
  });
});
