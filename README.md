# Code Tower Defense

Programowalne tower defense: dwa skrypty JavaScript będą rozgrywać lokalny pojedynek w jednej przeglądarce.

**Faza 2 — implementacja gotowa do przeglądu.** Moby poruszają się po obu planszach, można uruchomić, wstrzymać, wznowić i przerwać demonstrację, zmienić prędkość oraz utworzyć nowy mecz. Symetryczny scenariusz kończy się remisem po 26,5 s czasu symulacji. Ekonomia, walka i strategie pozostają w kolejnych fazach.

## Uruchomienie

Wymagane: Node **22.23.2** i npm **12.0.2**. Wersję Node zapisano także w `.nvmrc`.

```sh
cd code-tower-defense
nvm install
nvm use
npm install --global npm@12.0.2 # tylko jeśli masz inną wersję npm
npm ci
npm start
```

Jeżeli Node i npm mają już wskazane wersje, wystarczą `npm ci` i `npm start`. Nie potrzebujesz globalnego Angular CLI. Otwórz http://localhost:4200. Zatrzymaj serwer przez Ctrl+C. Do rysowania plansz potrzebna jest przeglądarka z WebGL; brak obsługi pokazuje komunikat przy planszy.

## Weryfikacja

```sh
npm run typecheck   # TypeScript aplikacji i testów
npm test           # Vitest przez Angular CLI, jednorazowo
npm run build      # produkcyjny build w dist/code-tower-defense/browser
npm run check      # wszystkie powyższe
npm run test:watch # testy podczas edycji
```

Testy obejmują inicjalizację i niezależność stanu meczu, przekazywanie konfiguracji, integrację widoku z rendererem, zwalnianie zasobów, błąd inicjalizacji grafiki i dostępność HTML przez axe-core. Test axe działa w jsdom, bez reguły kontrastu, która wymaga prawdziwego renderowania. Testy fazy 2 obejmują też trasowanie, zakręty, nakładanie się mobów, remisy i zwycięstwa, pauzę/reset, przyciski UI i identyczny stan końcowy przy różnych prędkościach oraz nieregularnych klatkach. Rzeczywisty obraz PixiJS wymaga także przeglądu w przeglądarce; status sprawdzeń znajduje się w raporcie odbioru fazy.

## Odbiór fazy 2

1. Otwórz aplikację i kliknij **Start**. Na obu polach pojawia się jeden mob na sekundę symulacji, także w pierwszym kroku. Moby mają kolor wysyłającego gracza; idą od `(0, 6)` do `(15, 6)`.
2. Kliknij **Pauza**: czas, pozycje i przepuszczenia zatrzymują się. **Wznów** kontynuuje ten sam mecz.
3. Sprawdź **0.5×, 1×, 2× i 4×**. Zmienia się tempo odtwarzania, a silnik nadal wykonuje kroki po 0,1 s. Prędkość można zmieniać również podczas pauzy.
4. Pozwól demonstracji dobiec do końca. Przy domyślnej konfiguracji jest to **remis, 20/20 przepuszczeń po obu stronach, czas 26,5 s**. Przy 4× trwa to około 7 s czasu rzeczywistego. Po zakończeniu stan przestaje się zmieniać.
5. Kliknij **Nowy mecz**. Wracają czas 0, brak mobów i 0 przepuszczeń; wybrana prędkość pozostaje ustawieniem odtwarzania. Możesz ponownie kliknąć Start.
6. W kolejnym meczu kliknij **Pauza**, potem **Przerwij**: wynik to „Mecz przerwany — bez zwycięzcy”. Przerwanie działa także w trakcie ruchu.

Demo produkuje darmowe moby podstawowe. Złoto pozostaje 200, a pokazany przychód +10 G/s jest parametrem przyszłej ekonomii. Na pustych planszach najkrótsza trasa jest prosta; trasy z przeszkodami i zakrętami są sprawdzane w testach, a widoczny labirynt powstanie w fazie 3.

Numer kroku w stanie oznacza liczbę zakończonych kroków; jego iloczyn z długością kroku daje widoczny czas. Akcje demonstracji są rozstrzygane na początku kroku, przed ruchem. Opóźnione klatki nie zmieniają wielkości kroków: zaległe kroki są zachowywane i wykonywane partiami. Pauza zatrzymuje dopływ czasu odtwarzania.

## Kolejność przeglądu kodu fazy 2

1. `src/game/engine/model.ts` — stan moba, krawędzi ruchu i wyniku meczu.
2. `src/game/engine/pathfinding.ts` — odległości od bazy (BFS) i deterministyczny wybór kierunku.
3. `src/game/engine/movement.ts`, `step.ts`, `outcome.ts` — ruch, przepuszczenia i wynik obu pól w jednym kroku.
4. `src/game/runtime/demo.ts`, `match-session.ts`, `playback.ts` — scenariusz, cykl życia meczu i odtwarzanie stałych kroków.
5. `src/app/match/match-store.ts` — Signals i planowanie klatek, powiązane z czasem życia areny.
6. `src/app/match-controls/match-controls.ts` — sterowanie i wynik; jeden przycisk Start/Pauza/Wznów zachowuje fokus.
7. `src/app/board/board.ts` i `src/game/renderer/board-renderer.ts` — przekazywanie mobów do renderera i ich prezentacja.

Testy znajdują się obok kodu, w plikach `.spec.ts`. Parametry gry są w `game-config.ts`, odstęp demonstracyjnej produkcji w `demo-config.ts`, a wygląd w `appearance.ts`.

## Stack i granice

Angular **22.2.2**, PixiJS **8.22.0**, TypeScript **6.0.3**, Vitest **5.0.4**. Dokładne zależności zapisano w `package.json` i `package-lock.json`. Standalone, domyślne w Angularze 22 OnPush i zoneless, `signal`, `computed` oraz signal inputs; bez Zone.js. Signal Forms będą używane, gdy powstaną formularze.

Silnik nie importuje Angulara ani PixiJS. UI czyta stan przez store, a renderer tylko go prezentuje. PixiJS ładuje się osobno i odrysowuje moby po zmianie stanu. Siatka jest tworzona raz; renderer nie prowadzi własnej symulacji. `@xmldom/xmldom` na liście `allowedCommonJsDependencies` jest zależnością PixiJS; wpis jawnie akceptuje jej format modułu, bez zmiany reguł gry.

Repozytorium utworzono przez Angular CLI, zgodnie z oficjalnymi [skillami Angulara](https://angular.dev/ai/agent-skills). Katalog `runtime` obsługuje już demonstrację. Katalog `strategy` i pliki strategii powstaną w fazie 5.

- [Odbiór fazy 2](docs/ODBIOR-FAZY-2.md)
- [Odbiór fazy 1](docs/ODBIOR-FAZY-1.md)
- [Plan faz](docs/PLAN-IMPLEMENTACJI.md)
- [Wymagania MVP](docs/WYMAGANIA-MVP.md)
- [Stack i infrastruktura](docs/STACK-I-INFRA.md)
- [API strategii](docs/API-STRATEGII.md)
- [Odbiór całego MVP](docs/ODBIOR-MVP.md)

Po każdej fazie zatrzymujemy się na przegląd użytkownika. Commit, push i ręczna publikacja wymagają osobnego polecenia.
