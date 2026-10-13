import type { MatchState, MobState, MobType, PlayerId, PlayerState, TowerState } from './model';
import { createDistanceField, distanceAt } from './pathfinding';
import { moveMob } from './movement';
import { validatePlacement } from './placement';

export type ActionError =
  | 'INVALID_ARGUMENT'
  | 'UNKNOWN_TYPE'
  | 'OUT_OF_BOUNDS'
  | 'RESERVED_CELL'
  | 'CELL_OCCUPIED'
  | 'PATH_BLOCKED'
  | 'INSUFFICIENT_GOLD'
  | 'TOWER_NOT_FOUND'
  | 'MAX_LEVEL';
export type ActionResult<T> =
  ({ readonly ok: true } & T) | { readonly ok: false; readonly error: ActionError };
export interface ActionOutcome<T> {
  readonly state: MatchState;
  readonly result: ActionResult<T>;
}

function rejected<T>(state: MatchState, error: ActionError): ActionOutcome<T> {
  return { state, result: { ok: false, error } };
}

function updatePlayer(
  state: MatchState,
  updated: PlayerState,
  nextEntityId = state.nextEntityId,
): MatchState {
  const field = createDistanceField(updated.board, updated.towers);
  // Refresh distances immediately; do not interrupt a partially traversed edge.
  const player = {
    ...updated,
    mobs: updated.mobs.map((mob) => moveMob(mob, updated.board, field, 0)),
  };
  return {
    ...state,
    nextEntityId,
    players: player.id === 1 ? [player, state.players[1]] : [state.players[0], player],
  };
}

export function buildTower(
  state: MatchState,
  playerId: PlayerId,
  type: unknown,
  x: unknown,
  y: unknown,
): ActionOutcome<{ towerId: number }> {
  if (
    typeof type !== 'string' ||
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    !Number.isInteger(x) ||
    !Number.isInteger(y)
  )
    return rejected(state, 'INVALID_ARGUMENT');
  if (type !== 'basic' && type !== 'splash') return rejected(state, 'UNKNOWN_TYPE');
  const player = state.players[playerId - 1];
  const error = validatePlacement(player, { x, y });
  if (error) return rejected(state, error);
  const stats = state.config.towers[type];
  if (player.gold < stats.cost) return rejected(state, 'INSUFFICIENT_GOLD');
  const tower: TowerState = {
    id: state.nextEntityId,
    type,
    level: 1,
    x,
    y,
    damage: stats.damage,
    range: stats.range,
    attackInterval: stats.attackInterval,
    cooldownRemaining: 0,
    totalSpent: stats.cost,
  };
  return {
    state: updatePlayer(
      state,
      { ...player, gold: player.gold - stats.cost, towers: [...player.towers, tower] },
      state.nextEntityId + 1,
    ),
    result: { ok: true, towerId: tower.id },
  };
}

export function sellTower(
  state: MatchState,
  playerId: PlayerId,
  towerId: unknown,
): ActionOutcome<{ towerId: number; refund: number }> {
  if (typeof towerId !== 'number' || !Number.isInteger(towerId) || towerId < 1)
    return rejected(state, 'INVALID_ARGUMENT');
  const player = state.players[playerId - 1];
  const tower = player.towers.find((item) => item.id === towerId);
  if (!tower) return rejected(state, 'TOWER_NOT_FOUND');
  const refund = tower.totalSpent * state.config.economy.sellRefundRatio;
  return {
    state: updatePlayer(state, {
      ...player,
      gold: player.gold + refund,
      towers: player.towers.filter((item) => item.id !== towerId),
    }),
    result: { ok: true, towerId, refund },
  };
}

export function spawnMob(
  state: MatchState,
  playerId: PlayerId,
  type: unknown,
): ActionOutcome<{ mobId: number }> {
  if (typeof type !== 'string') return rejected(state, 'INVALID_ARGUMENT');
  if (type !== 'basic' && type !== 'heavy') return rejected(state, 'UNKNOWN_TYPE');
  const owner = state.players[playerId - 1];
  const defender = state.players[playerId === 1 ? 1 : 0];
  const stats = state.config.mobs[type];
  if (owner.gold < stats.cost) return rejected(state, 'INSUFFICIENT_GOLD');
  const level = owner.mobLevels[type];
  const hp = stats.hp * state.config.upgrades.mobHealthMultipliers[level - 1];
  const entry = defender.board.entry;
  const mob: MobState = {
    id: state.nextEntityId,
    ownerId: playerId,
    type,
    level,
    x: entry.x,
    y: entry.y,
    hp,
    maxHp: hp,
    speed: stats.speed,
    reward: stats.reward,
    from: entry,
    to: entry,
    progress: 0,
    remainingDistance: distanceAt(createDistanceField(defender.board, defender.towers), entry),
  };
  const paid = updatePlayer(state, { ...owner, gold: owner.gold - stats.cost });
  return {
    state: updatePlayer(
      paid,
      { ...paid.players[defender.id - 1], mobs: [...defender.mobs, mob] },
      state.nextEntityId + 1,
    ),
    result: { ok: true, mobId: mob.id },
  };
}

export function upgradeTower(
  state: MatchState,
  playerId: PlayerId,
  towerId: unknown,
): ActionOutcome<{ towerId: number; level: number }> {
  if (typeof towerId !== 'number' || !Number.isInteger(towerId) || towerId < 1)
    return rejected(state, 'INVALID_ARGUMENT');
  const player = state.players[playerId - 1];
  const tower = player.towers.find((item) => item.id === towerId);
  if (!tower) return rejected(state, 'TOWER_NOT_FOUND');
  if (tower.level >= state.config.upgrades.towerDamageMultipliers.length)
    return rejected(state, 'MAX_LEVEL');
  const base = state.config.towers[tower.type];
  const cost = base.cost * state.config.upgrades.towerCostMultipliers[tower.level - 1];
  if (player.gold < cost) return rejected(state, 'INSUFFICIENT_GOLD');
  const level = tower.level + 1;
  const upgraded = {
    ...tower,
    level,
    damage: base.damage * state.config.upgrades.towerDamageMultipliers[level - 1],
    totalSpent: tower.totalSpent + cost,
  };
  return {
    state: updatePlayer(state, {
      ...player,
      gold: player.gold - cost,
      towers: player.towers.map((item) => (item.id === towerId ? upgraded : item)),
    }),
    result: { ok: true, towerId, level },
  };
}

export function upgradeMob(
  state: MatchState,
  playerId: PlayerId,
  type: unknown,
): ActionOutcome<{ type: MobType; level: number }> {
  if (typeof type !== 'string') return rejected(state, 'INVALID_ARGUMENT');
  if (type !== 'basic' && type !== 'heavy') return rejected(state, 'UNKNOWN_TYPE');
  const player = state.players[playerId - 1];
  const currentLevel = player.mobLevels[type];
  if (currentLevel >= state.config.upgrades.mobHealthMultipliers.length)
    return rejected(state, 'MAX_LEVEL');
  const cost = state.config.upgrades.mobCosts[currentLevel - 1];
  if (player.gold < cost) return rejected(state, 'INSUFFICIENT_GOLD');
  const level = currentLevel + 1;
  return {
    state: updatePlayer(state, {
      ...player,
      gold: player.gold - cost,
      mobLevels: { ...player.mobLevels, [type]: level },
    }),
    result: { ok: true, type, level },
  };
}
