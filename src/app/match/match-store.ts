import { computed, DestroyRef, inject, InjectionToken, Service, signal } from '@angular/core';
import { MatchSession } from '../../game/runtime/match-session';
import { Playback, PLAYBACK_SPEEDS, type PlaybackSpeed } from '../../game/runtime/playback';

export interface FrameScheduler {
  request(callback: (timestamp: number) => void): number;
  cancel(id: number): void;
}
export const FRAME_SCHEDULER = new InjectionToken<FrameScheduler>('Animation frames', {
  providedIn: 'root',
  factory: () => ({
    request: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  }),
});

@Service()
export class MatchStore {
  private readonly session = new MatchSession();
  private readonly playback = new Playback(this.session.state.config.simulation.stepSeconds * 1000);
  private readonly scheduler = inject(FRAME_SCHEDULER);
  private readonly currentMatch = signal(this.session.state);
  private readonly currentSpeed = signal<PlaybackSpeed>(1);
  private frameId: number | null = null;
  private previousTime: number | null = null;
  readonly state = this.currentMatch.asReadonly();
  readonly speed = this.currentSpeed.asReadonly();
  readonly speeds = PLAYBACK_SPEEDS;
  readonly time = computed(() => this.state().tick * this.state().config.simulation.stepSeconds);
  readonly statusLabel = computed(
    () =>
      ({ ready: 'Przygotowanie', running: 'W toku', paused: 'Pauza', finished: 'Zakończony' })[
        this.state().status
      ],
  );
  readonly resultLabel = computed(() => {
    const result = this.state().result;
    if (!result) return '';
    if (result.reason === 'interrupted') return 'Mecz przerwany — bez zwycięzcy';
    return result.winnerId === null ? 'Remis' : `Wygrywa gracz ${result.winnerId}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopFrames());
  }

  start(): void {
    this.session.start();
    this.publish();
    if (this.state().status === 'running' && this.frameId === null) this.schedule();
  }

  pause(): void {
    this.session.pause();
    this.stopFrames();
    this.publish();
  }

  interrupt(): void {
    this.session.interrupt();
    this.stopFrames();
    this.playback.reset();
    this.publish();
  }

  reset(): void {
    this.stopFrames();
    this.playback.reset();
    this.session.reset();
    this.publish();
  }

  setSpeed(speed: PlaybackSpeed): void {
    this.currentSpeed.set(speed);
  }

  private publish(): void {
    this.currentMatch.set(this.session.state);
  }

  private schedule(): void {
    this.frameId = this.scheduler.request((timestamp) => {
      this.frameId = null;
      if (this.previousTime !== null) {
        this.playback.advance(timestamp - this.previousTime, this.speed(), () =>
          this.session.step(),
        );
        this.publish();
      }
      this.previousTime = timestamp;
      if (this.state().status === 'running') this.schedule();
      else this.previousTime = null;
    });
  }

  private stopFrames(): void {
    if (this.frameId !== null) this.scheduler.cancel(this.frameId);
    this.frameId = null;
    this.previousTime = null;
  }
}
