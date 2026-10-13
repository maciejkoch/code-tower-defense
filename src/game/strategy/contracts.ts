import type { GameConfig, BoardConfig } from '../config/game-config';
import type { ActionResult } from '../engine/actions';
import type { MobState, MobType, PlayerId, TowerState } from '../engine/model';

export type MobView = Omit<MobState, 'from' | 'to' | 'progress'>;
export interface PlayerView {
  readonly id: PlayerId;
  readonly gold: number;
  readonly income: number;
  readonly leaks: number;
  readonly mobLevels: Readonly<Record<MobType, number>>;
  readonly board: Pick<BoardConfig, 'width' | 'height' | 'entry' | 'base'>;
  readonly towers: readonly TowerState[];
  readonly mobs: readonly MobView[];
  readonly outgoingMobs: readonly MobView[];
  readonly queuedMobs: readonly MobView[];
  readonly outgoingQueue: readonly MobView[];
}
export interface StrategyState {
  readonly tick: number;
  readonly time: number;
  readonly config: GameConfig;
  readonly self: PlayerView;
  readonly opponent: PlayerView;
}
export interface StrategyApi {
  readonly memory: Record<string, unknown>;
  buildTower(type: unknown, x: unknown, y: unknown): ActionResult<{ towerId: number }>;
  upgradeTower(towerId: unknown): ActionResult<{ towerId: number; level: number }>;
  sellTower(towerId: unknown): ActionResult<{ towerId: number; refund: number }>;
  spawnMob(type: unknown): ActionResult<{ mobId: number }>;
  upgradeMob(type: unknown): ActionResult<{ type: MobType; level: number }>;
  log(message: unknown): void;
}
export interface Strategy {
  readonly name: string;
  readonly onTick: (state: StrategyState, api: StrategyApi) => unknown;
}
export type StrategyPair = readonly [Strategy, Strategy];
