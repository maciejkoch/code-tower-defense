import { DecimalPipe } from '@angular/common';
import { PlayerLog } from './player-log/player-log';
import { MatchControls } from './match-controls/match-controls';
import { Component, inject } from '@angular/core';
import { Board } from './board/board';
import { MatchStore } from './match/match-store';
import { DEMO_CONFIG } from '../game/config/demo-config';
import { APPEARANCE } from '../game/renderer/appearance';

@Component({
  selector: 'app-root',
  imports: [Board, MatchControls, PlayerLog, DecimalPipe],
  providers: [MatchStore],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly match = inject(MatchStore);
  protected readonly demo = DEMO_CONFIG;
  protected readonly upgradeTimes = DEMO_CONFIG.mobUpgradeTimes.join(' i ');
  protected readonly playerColors = APPEARANCE.players;
}
