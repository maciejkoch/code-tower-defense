export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/** Convert elapsed real time into whole simulation steps without changing their size. */
export class Playback {
  private accumulatedMs = 0;

  constructor(private readonly stepMs: number) {
    if (!Number.isFinite(stepMs) || stepMs <= 0) throw new Error('Invalid simulation step');
  }

  advance(elapsedMs: number, speed: PlaybackSpeed, step: () => boolean): number {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return 0;
    this.accumulatedMs += elapsedMs * speed;
    let count = 0;
    // Bound work per frame, retaining all remaining steps instead of dropping time.
    while (this.accumulatedMs + 1e-7 >= this.stepMs && count < 100) {
      this.accumulatedMs = Math.max(0, this.accumulatedMs - this.stepMs);
      count++;
      if (!step()) {
        this.reset();
        break;
      }
    }
    return count;
  }

  reset(): void {
    this.accumulatedMs = 0;
  }
}
