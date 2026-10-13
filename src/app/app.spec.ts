import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { LOAD_BOARD_RENDERER } from './board/board';
import { run } from 'axe-core';
import {
  FRAME_SCHEDULER,
  STRATEGY_PAIR,
  MatchStore,
  type FrameScheduler,
} from './match/match-store';
import type { StrategyPair } from '../game/strategy/contracts';

const renderer = { mount: vi.fn(), drawUnits: vi.fn(), setPlayback: vi.fn(), destroy: vi.fn() };
const frames = new Map<number, (time: number) => void>();
let frameId = 0;
const scheduler: FrameScheduler = {
  request: (callback) => {
    frames.set(++frameId, callback);
    return frameId;
  },
  cancel: (id) => {
    frames.delete(id);
  },
};
function advanceFrame(time: number): void {
  const pending = [...frames.entries()];
  for (const [id, callback] of pending) {
    frames.delete(id);
    callback(time);
  }
}

describe('Arena', () => {
  it('identifies strategy errors, escapes their message and cancels playback', async () => {
    const broken: StrategyPair = [
      { name: 'First', onTick: () => undefined },
      {
        name: 'Second',
        onTick: (state) => {
          if (state.tick === 2) throw new Error('<script>alert(1)</script>');
        },
      },
    ];
    TestBed.overrideProvider(STRATEGY_PAIR, { useValue: broken });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(MatchStore);
    store.start();
    advanceFrame(0);
    advanceFrame(500);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Błąd strategii gracza 2');
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      '<script>alert(1)</script>',
    );
    expect(page.querySelector('script')).toBeNull();
    expect(store.state().result).toMatchObject({
      reason: 'strategy-error',
      winnerId: null,
      playerId: 2,
    });
    expect(store.state().tick).toBe(2);
    expect(frames.size).toBe(0);
    store.reset();
    await fixture.whenStable();
    expect(store.state().result).toBeNull();
    expect(store.state().players[1].logs).toEqual([]);
    expect(page.querySelector('[role="status"]')).toBeNull();
  });
  beforeEach(async () => {
    vi.clearAllMocks();
    frames.clear();
    renderer.mount.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: LOAD_BOARD_RENDERER, useValue: async () => renderer },
        { provide: FRAME_SCHEDULER, useValue: scheduler },
      ],
    }).compileComponents();
  });

  it('presents two configured boards and releases both renderers with the view', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await vi.waitFor(() => expect(renderer.mount).toHaveBeenCalledTimes(2));
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelectorAll('app-board')).toHaveLength(2);
    expect(page.querySelector('#player-1')?.textContent).toBe('Gracz 1');
    expect(page.querySelector('#player-2')?.textContent).toBe('Gracz 2');
    expect(page.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('16 na 12');
    expect(page.textContent).toContain('Więcej jednostek, dłuższe trasy');
    expect(page.querySelector('[role="alert"]')).toBeNull();
    fixture.destroy();
    expect(renderer.destroy).toHaveBeenCalledTimes(2);
  });

  it('keeps the initial state readable if GPU initialization fails', async () => {
    renderer.mount.mockRejectedValue(new Error('WebGL unavailable'));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await vi.waitFor(() => {
      const page: HTMLElement = fixture.nativeElement;
      expect(page.querySelectorAll('[role="alert"]')).toHaveLength(2);
      expect(page.querySelector('.gold')?.textContent).toContain('200');
    });
  });

  it('has no automatic accessibility violations in the initial interface', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const result = await run(fixture.nativeElement, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      // jsdom has no layout/canvas. Contrast is checked in the browser instead.
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations.map(({ id, description }) => ({ id, description }))).toEqual([]);
  });

  it('connects controls, pause, speed, interruption and reset to the displayed state', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(MatchStore);
    const page: HTMLElement = fixture.nativeElement;
    const primary = page.querySelector<HTMLButtonElement>('.primary')!;
    const button = (label: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('button')].find(
        (item) => item.textContent?.trim() === label,
      )!;
    primary.focus();
    primary.click();
    await fixture.whenStable();
    expect(primary.textContent).toContain('Pauza');
    expect(document.activeElement).toBe(primary);
    store.start(); // Repeated start must not add a second playback loop.
    expect(frames.size).toBe(1);
    advanceFrame(0);
    advanceFrame(300);
    await fixture.whenStable();
    expect(store.state().tick).toBe(3);
    expect(store.state().players[0].mobs[0].x).toBeCloseTo(0.3);
    expect(page.querySelector('.stats')?.textContent).toContain('+32');
    expect(page.textContent).toContain('W kolejce:');
    expect(renderer.drawUnits).toHaveBeenCalledWith(
      store.state().players[0].mobs,
      store.state().players[0].towers,
      store.state().attacks,
    );
    primary.click();
    await fixture.whenStable();
    const paused = store.state();
    expect(renderer.setPlayback).toHaveBeenCalledWith(false, 1);
    advanceFrame(100000);
    button('4×').click();
    await fixture.whenStable();
    expect(store.state()).toBe(paused);
    expect(frames.size).toBe(0);
    expect(button('4×').getAttribute('aria-pressed')).toBe('true');
    expect(renderer.setPlayback).toHaveBeenCalledWith(false, 4);
    expect(primary.textContent).toContain('Wznów');
    primary.click();
    advanceFrame(100000);
    advanceFrame(100025);
    await fixture.whenStable();
    expect(store.state().tick).toBe(4);
    button('Przerwij').click();
    await fixture.whenStable();
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Mecz przerwany');
    expect(frames.size).toBe(0);
    button('Nowy mecz').click();
    await fixture.whenStable();
    expect(store.state().tick).toBe(0);
    expect(store.state().players[0].mobs).toEqual([]);
    expect(store.state().nextEntityId).toBe(1);
    expect(page.querySelector('[role="status"]')).toBeNull();
    primary.click();
    fixture.destroy();
    expect(frames.size).toBe(0);
  });

  it('shows the result of the default strategies and stops scheduling frames', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const store = fixture.debugElement.injector.get(MatchStore);
    store.setSpeed(4);
    store.start();
    advanceFrame(0);
    for (let i = 1; i <= 40 && store.state().status === 'running'; i++) advanceFrame(i * 2500);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Wygrywa gracz 1');
    expect(page.querySelector('[role="status"]')?.textContent).toContain('32.2');
    expect(frames.size).toBe(0);
    expect(page.querySelector<HTMLButtonElement>('.primary')?.disabled).toBe(true);
    const result = await run(page, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
