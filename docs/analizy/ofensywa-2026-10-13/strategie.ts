import type { Strategy } from '../../../src/game/strategy/contracts';
export const defense: Strategy = { name: 'Tylko obrona', onTick(state, api) {
  const plan: {x:number,y:number}[] = [];
  [3,7,11].forEach((x,i)=> {
    const rows=Array.from({length:state.self.board.height},(_,y)=>y).filter(y=>y!==(i%2===0?1:state.self.board.height-2));
    rows.sort((a,b)=>Math.abs(a-state.self.board.entry.y)-Math.abs(b-state.self.board.entry.y)||b-a);
    rows.forEach(y=>plan.push({x,y}));
  });
  let gold=state.self.gold;
  const cluster=state.self.mobs.some(m=>state.self.mobs.filter(n=>Math.hypot(m.x-n.x,m.y-n.y)<=1.5).length>=3);
  for (const cell of plan) {
    if (state.self.towers.some(t=>t.x===cell.x&&t.y===cell.y)) continue;
    const splashCount=state.self.towers.filter(t=>t.type==='splash').length;
    const type=cluster && splashCount<Math.ceil(state.self.towers.length/3)?'splash':'basic';
    const cost=state.config.towers[type].cost;
    if (gold<cost) break;
    if (api.buildTower(type,cell.x,cell.y).ok) gold-=cost;
  }
  if (state.self.towers.length>=plan.length) {
    for (const tower of [...state.self.towers].sort((a,b)=>a.level-b.level)) {
      if(tower.level>=3) continue;
      const cost=state.config.towers[tower.type].cost*state.config.upgrades.towerCostMultipliers[tower.level-1];
      if(gold>=cost && api.upgradeTower(tower.id).ok) gold-=cost;
    }
  }
}};
export function attacker(type:'basic'|'heavy',upgrades:boolean): Strategy {
  return {name:`Atak ${type}${upgrades?' z ulepszeniami':''}`,onTick(state,api){
    let gold=state.self.gold;
    if(upgrades && state.self.mobLevels[type]<3){
      const reserve=(api.memory['reserve'] as number|undefined)??0;
      const previous=(api.memory['previous'] as number|undefined)??0;
      const saved=reserve+Math.max(0,gold-previous)*0.3;
      const cost=state.config.upgrades.mobCosts[state.self.mobLevels[type]-1];
      if(saved>=cost && api.upgradeMob(type).ok){gold-=cost;api.memory['reserve']=saved-cost;}else api.memory['reserve']=saved;
    }else api.memory['reserve']=0;
    const usable=gold-Number(api.memory['reserve']??0);
    const count=Math.floor(usable/state.config.mobs[type].cost);
    // Release full overlapping waves, a stress case for splash.
    if(count>=4 || (state.time>15&&count>=2)) for(let i=0;i<count;i++){
      if(!api.spawnMob(type).ok)break;
      gold-=state.config.mobs[type].cost;
    }
    api.memory['previous']=gold;
  }};
}
