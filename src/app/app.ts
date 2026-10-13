import { DecimalPipe } from '@angular/common';
import { MatchControls } from './match-controls/match-controls';
import { Component, inject } from '@angular/core';
import { Board } from './board/board';
import { MatchStore } from './match/match-store';
import { APPEARANCE } from '../game/renderer/appearance';

@Component({
  selector: 'app-root',
  imports: [Board, MatchControls, DecimalPipe],
  providers: [MatchStore],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly match = inject(MatchStore);
  protected readonly playerColors = APPEARANCE.players;
}
