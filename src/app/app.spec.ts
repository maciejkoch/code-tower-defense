import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { LOAD_BOARD_RENDERER } from './board/board';
import { run } from 'axe-core';

const renderer = { mount: vi.fn(), destroy: vi.fn() };

describe('Arena', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    renderer.mount.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: LOAD_BOARD_RENDERER, useValue: async () => renderer }],
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
    expect(page.textContent).toContain('podgląd stanu początkowego');
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
});
