import type { GameConfig } from '../../../src/game/config/game-config';
import capturedConfig from './konfiguracja.json';
const GAME_CONFIG = capturedConfig as GameConfig;
import { createMatch } from '../../../src/game/engine/create-match';
import { resolveCombat } from '../../../src/game/engine/combat';
import { stepMatch } from '../../../src/game/engine/step';
import { StrategyRuntime } from '../../../src/game/strategy/strategy-runtime';
import { POLICIES, runTactics } from './taktyki.mjs';
const BENCHMARK_STRATEGIES = Object.fromEntries(Object.entries(POLICIES).map(([key,policy]) => [key,{name:policy.name,onTick:(state,api)=>runTactics(state,api,policy)}]));
import { defense, attacker } from './strategie';
import type { Strategy,StrategyPair } from '../../../src/game/strategy/contracts';
const pairs:Record<string,StrategyPair>={
  'defense/basic':[defense,attacker('basic',false)],
  'defense/heavy':[defense,attacker('heavy',true)],
  'defense/balanced':[defense,BENCHMARK_STRATEGIES.balanced],
  'balanced/heavy':[BENCHMARK_STRATEGIES.balanced,BENCHMARK_STRATEGIES.heavy],
  'balanced/balanced':[BENCHMARK_STRATEGIES.balanced,BENCHMARK_STRATEGIES.balanced],
  'defense/defense':[defense,defense],
};
const modes=[{name:'supportOnly',roi:0,ramp:false},{name:'incomeCap90',roi:.02,ramp:false},{name:'incomeCap90Ramp',roi:.02,ramp:true}];
for(const mode of modes) for(const [pair,strategies] of Object.entries(pairs)){
  const config=structuredClone(GAME_CONFIG);
  if(mode.name!=='baseline'){
    config.mobs.basic.reward=1;config.mobs.heavy.reward=3;
    config.upgrades.mobCosts=[100,200];
  }
  let extras=[0,0];let produced=[0,0];
  const wrapped=strategies.map((strategy,i)=>({name:strategy.name,onTick(state,api){
    strategy.onTick(state,{...api,spawnMob(type){
      const result=api.spawnMob(type);
      if(result.ok){extras[i]=Math.min(60,extras[i]+config.mobs[type].cost*mode.roi);produced[i]++;}
      return result;
    }});
  }} satisfies Strategy)) as unknown as StrategyPair;
  const runtime=new StrategyRuntime(wrapped);
  let state=resolveCombat(runtime.run({...createMatch(config),status:'running'}),0);
  let maxLive=0;
  while(state.status==='running'&&state.tick<3000){
    state=stepMatch(state,s=>{
      const paid={...s,players:s.players.map((p,i)=>({...p,gold:p.gold+extras[i]*s.config.simulation.stepSeconds})) as unknown as typeof s.players};
      const next=runtime.run(paid);
      // Each newly spawned mob receives overtime HP once; no changes to live mob statistics.
      if(mode.ramp){const time=next.tick*config.simulation.stepSeconds;const mult=Math.pow(2,Math.max(0,time-90)/45);
        return {...next,players:next.players.map(p=>({...p,mobs:p.mobs.map(m=>m.id>=s.nextEntityId?{...m,hp:m.hp*mult,maxHp:m.maxHp*mult}:m)})) as unknown as typeof next.players};
      }
      return next;
    });
    maxLive=Math.max(maxLive,state.players.reduce((n,p)=>n+p.mobs.length,0));
  }
  console.log(JSON.stringify({mode:mode.name,pair,time:+(state.tick*.1).toFixed(1),finished:state.status==='finished',result:state.result,leaks:state.players.map(p=>p.leaks),towers:state.players.map(p=>p.towers.length),income:extras.map(n=>Math.round(config.economy.goldPerSecond+n)),produced,maxLive}));
}
