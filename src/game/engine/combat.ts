import type { AttackEvent } from './events';
import type { MatchState, MobState, PlayerState, TowerState } from './model';

const EPSILON = 1e-9;
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export function selectTarget(tower: TowerState, mobs: readonly MobState[]): MobState | null {
  let target: MobState | null = null;
  for (const mob of mobs) {
    if (mob.hp <= 0 || distance(tower, mob) > tower.range + EPSILON) continue;
    if (
      !target ||
      mob.remainingDistance < target.remainingDistance - EPSILON ||
      (Math.abs(mob.remainingDistance - target.remainingDistance) <= EPSILON && mob.id < target.id)
    )
      target = mob;
  }
  return target;
}

/** Select every attack from the same pre-damage state, then sum and apply damage. */
export function resolveCombat(state: MatchState, elapsedSeconds: number): MatchState {
  if (state.status !== 'running') return state;
  const attacks: AttackEvent[] = [];
  const defend = (player: PlayerState): PlayerState => {
    const damage = new Map<number, number>();
    const towers = player.towers.map((tower) => {
      const cooldownRemaining = Math.max(0, tower.cooldownRemaining - elapsedSeconds);
      if (cooldownRemaining > EPSILON) return { ...tower, cooldownRemaining };
      const target = selectTarget(tower, player.mobs);
      if (!target) return { ...tower, cooldownRemaining: 0 };
      const splashRadius =
        tower.type === 'splash' ? (state.config.towers.splash.splashRadius ?? 0) : 0;
      const victims =
        tower.type === 'splash'
          ? player.mobs.filter(
              (mob) => mob.hp > 0 && distance(mob, target) <= splashRadius + EPSILON,
            )
          : [target];
      for (const mob of victims) damage.set(mob.id, (damage.get(mob.id) ?? 0) + tower.damage);
      attacks.push({
        tick: state.tick,
        playerId: player.id,
        towerId: tower.id,
        targetMobId: target.id,
        from: { x: tower.x, y: tower.y },
        target: { x: target.x, y: target.y },
        splashRadius,
      });
      return { ...tower, cooldownRemaining: tower.attackInterval };
    });
    const damaged = player.mobs.map((mob) => ({
      ...mob,
      hp: Math.max(0, mob.hp - (damage.get(mob.id) ?? 0)),
    }));
    const killed = damaged.filter((mob) => mob.hp === 0);
    const reward = killed.reduce((total, mob) => total + mob.reward, 0);
    const logs = killed.map((mob) => ({
      tick: state.tick,
      time: state.tick * state.config.simulation.stepSeconds,
      kind: 'success' as const,
      message: `Zabicie ${mob.type} #${mob.id}, nagroda ${mob.reward} G`,
    }));
    return {
      ...player,
      towers,
      mobs: damaged.filter((mob) => mob.hp > 0),
      gold: player.gold + reward,
      logs: [...player.logs, ...logs],
    };
  };
  const players = [defend(state.players[0]), defend(state.players[1])] as const;
  return { ...state, players, attacks };
}
