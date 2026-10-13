// Snapshot of the strategies used for this analysis.
// src/strategies/tactics.js
var POLICIES = {
  balanced: {
    name: "Adaptacyjny kontratak",
    style: "balanced",
    attackShare: 0.6,
    defenseShare: 0.25,
    upgradeShare: 0.15,
    waveSize: 10,
    waveInterval: 2
  },
  heavy: {
    name: "Ci\u0119\u017Ckie fale",
    style: "heavy",
    attackShare: 0.6,
    defenseShare: 0.2,
    upgradeShare: 0.2,
    waveSize: 5,
    waveInterval: 3
  },
  rush: {
    name: "Szybki nap\xF3r",
    style: "rush",
    attackShare: 0.65,
    defenseShare: 0.25,
    upgradeShare: 0.1,
    waveSize: 4,
    waveInterval: 2
  },
  swarm: {
    name: "R\xF3j",
    style: "swarm",
    attackShare: 0.6,
    defenseShare: 0.25,
    upgradeShare: 0.15,
    waveSize: 10,
    waveInterval: 5
  },
  maze: {
    name: "Labirynt",
    style: "maze",
    attackShare: 0.55,
    defenseShare: 0.3,
    upgradeShare: 0.15,
    waveSize: 6,
    waveInterval: 4
  }
};
function buildPlan(state, policy) {
  const { width, height, entry, base } = state.self.board;
  const cells = [];
  const columns = policy.style === "maze" ? [3, 7, 11] : [4, 8, 12];
  columns.forEach((x, index) => {
    const gap = index % 2 === 0 ? 1 : height - 2;
    const rows = Array.from({ length: height }, (_, y) => y).filter((y) => y !== gap);
    rows.sort((a, b) => Math.abs(a - entry.y) - Math.abs(b - entry.y) || b - a);
    rows.forEach((y) => cells.push({ x, y }));
  });
  return cells.filter(
    (cell, i, all) => cell.x >= 0 && cell.x < width && cell.y >= 0 && cell.y < height && !(cell.x === entry.x && cell.y === entry.y) && !(cell.x === base.x && cell.y === base.y) && all.findIndex((other) => other.x === cell.x && other.y === cell.y) === i
  );
}
function clusteredMobs(state) {
  const radius = state.config.towers.splash.splashRadius ?? 0;
  return state.self.mobs.reduce(
    (largest, center) => Math.max(
      largest,
      state.self.mobs.filter((mob) => Math.hypot(mob.x - center.x, mob.y - center.y) <= radius).length
    ),
    0
  );
}
function runTactics(state, api, policy) {
  const firstTick = !api.memory["wallet"];
  if (!api.memory["wallet"])
    api.memory["wallet"] = {
      attack: 0,
      defense: 0,
      upgrades: 0,
      expectedGold: 0,
      nextWave: 0,
      lastLeaks: 0,
      planIndex: 0
    };
  const wallet = (
    /** @type {Wallet} */
    api.memory["wallet"]
  );
  let gold = state.self.gold;
  const earned = Math.max(0, gold - wallet.expectedGold);
  wallet.attack += earned * policy.attackShare;
  wallet.defense += earned * policy.defenseShare;
  wallet.upgrades += earned * policy.upgradeShare;
  if (firstTick) {
    const minimumDefense = state.config.towers.basic.cost * 2;
    const fromUpgrades = Math.min(wallet.upgrades, Math.max(0, minimumDefense - wallet.defense));
    wallet.upgrades -= fromUpgrades;
    wallet.defense += fromUpgrades;
    const fromAttack = Math.min(wallet.attack, Math.max(0, minimumDefense - wallet.defense));
    wallet.attack -= fromAttack;
    wallet.defense += fromAttack;
  }
  const accounted = wallet.attack + wallet.defense + wallet.upgrades;
  if (accounted > gold + 1e-6) {
    const ratio = gold / accounted;
    wallet.attack *= ratio;
    wallet.defense *= ratio;
    wallet.upgrades *= ratio;
  }
  if (state.self.leaks > wallet.lastLeaks) {
    wallet.defense += wallet.upgrades * 0.5;
    wallet.upgrades *= 0.5;
    api.log(`Reakcja na przepuszczenie: zwi\u0119kszam bud\u017Cet obrony.`);
  }
  wallet.lastLeaks = state.self.leaks;
  const plan = buildPlan(state, policy);
  const weightedThreat = state.self.mobs.reduce(
    (total, mob) => total + mob.maxHp / state.config.mobs.basic.hp,
    0
  );
  const desiredTowers = Math.min(
    plan.length,
    Math.max(2, Math.ceil(weightedThreat / 8) + 2 + Math.floor(state.time / 20))
  );
  let towerCount = state.self.towers.length;
  const cluster = clusteredMobs(state);
  if (towerCount < desiredTowers && wallet.planIndex < plan.length) {
    const type2 = towerCount >= 2 && cluster >= 4 && state.self.mobs.filter((mob) => mob.type === "basic").length >= state.self.mobs.length * 0.6 && state.self.towers.filter((t) => t.type === "splash").length < Math.ceil(towerCount / 3) ? "splash" : "basic";
    const cost = state.config.towers[type2].cost;
    if (wallet.defense >= cost && gold >= cost) {
      const cell = plan[wallet.planIndex];
      const action = api.buildTower(type2, cell.x, cell.y);
      if (action.ok) {
        wallet.defense -= cost;
        gold -= cost;
        towerCount++;
        wallet.planIndex++;
        api.log(`Budowa ${type2} #${action.towerId} (${cell.x}, ${cell.y}).`);
      } else if (action.error !== "CELL_OCCUPIED") {
        wallet.planIndex++;
        api.log(`Pomijam pole (${cell.x}, ${cell.y}): ${action.error}.`);
      }
    }
  } else {
    const tower = [...state.self.towers].filter((t) => t.level < 3).sort((a, b) => a.level - b.level || a.id - b.id)[0];
    if (tower) {
      const cost = state.config.towers[tower.type].cost * state.config.upgrades.towerCostMultipliers[tower.level - 1];
      if (wallet.defense >= cost && gold >= cost) {
        const action = api.upgradeTower(tower.id);
        if (action.ok) {
          wallet.defense -= cost;
          gold -= cost;
          api.log(`Ulepszenie wie\u017Cy #${tower.id}: poziom ${action.level}.`);
        }
      }
    }
  }
  const splashShare = state.opponent.towers.filter((t) => t.type === "splash").length / Math.max(1, state.opponent.towers.length);
  const type = policy.style === "heavy" || policy.style === "balanced" && splashShare >= 0.25 ? "heavy" : "basic";
  const level = state.self.mobLevels[type];
  if (level < 3) {
    const cost = state.config.upgrades.mobCosts[level - 1];
    if (wallet.upgrades >= cost && gold >= cost) {
      const action = api.upgradeMob(type);
      if (action.ok) {
        wallet.upgrades -= cost;
        gold -= cost;
        api.log(`Produkcja ${type}: poziom ${action.level}.`);
      }
    }
  } else {
    wallet.attack += wallet.upgrades;
    wallet.upgrades = 0;
  }
  const unitCost = state.config.mobs[type].cost;
  const affordable = Math.floor(Math.min(wallet.attack, gold) / unitCost);
  if (state.tick >= wallet.nextWave && affordable >= Math.min(2, policy.waveSize)) {
    const count = Math.min(policy.waveSize, affordable);
    let sent = 0;
    for (let i = 0; i < count; i++) {
      const action = api.spawnMob(type);
      if (!action.ok) break;
      wallet.attack -= unitCost;
      gold -= unitCost;
      sent++;
    }
    wallet.nextWave = state.tick + Math.max(1, Math.round(policy.waveInterval / state.config.simulation.stepSeconds));
    if (sent) api.log(`Fala: ${sent} \xD7 ${type}, poziom ${state.self.mobLevels[type]}.`);
  }
  wallet.expectedGold = gold;
}


export { POLICIES, runTactics };
