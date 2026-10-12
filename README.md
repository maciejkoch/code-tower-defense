# Code Tower Defense

Programowalne tower defense: dwa skrypty JavaScript będą rozgrywać lokalny pojedynek w jednej przeglądarce.

**Faza 1 — gotowa do przeglądu.** Aplikacja wyświetla dwa pola obrony 16 × 12 w PixiJS, wejścia, bazy i początkowe statystyki. Symulacja i sterowanie meczem pojawią się w fazie 2. Strategie i formularze nie są jeszcze zaimplementowane.

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

Testy obejmują inicjalizację i niezależność stanu meczu, przekazywanie konfiguracji, integrację widoku z rendererem, zwalnianie zasobów, błąd inicjalizacji grafiki i dostępność HTML przez axe-core. Test axe działa w jsdom, bez reguły kontrastu, która wymaga prawdziwego renderowania. Renderowanie PixiJS sprawdzamy także w przeglądarce.

## Odbiór fazy 1

1. Uruchom aplikację. Na szerokim oknie zobaczysz dwa pola obok siebie, na wąskim jedno pod drugim.
2. Sprawdź siatki 16 × 12, wejście ze strzałką `(0, 6)` i bazę z tarczą `(15, 6)` dla obu graczy.
3. Każdy gracz ma 200 złota, 0/20 przepuszczeń i poziom 1 obu typów mobów. Przychód +10 G/s to parametr przyszłej symulacji; w tej fazie saldo i czas nie rosną.
4. Odśwież stronę i zmień szerokość okna. Plansze powinny zachować proporcje i poprawnie się załadować.
5. Opcjonalnie zmień `economy.startingGold` w `src/game/config/game-config.ts` i odśwież stronę: oba salda powinny używać nowej wartości. Cofnij zmianę po sprawdzeniu.

## Kolejność przeglądu kodu

1. `src/game/config/game-config.ts` — wspólna konfiguracja zasad gry, w tym parametry kolejnych faz.
2. `src/game/engine/model.ts` i `create-match.ts` — minimalny model stanu początkowego, bez zależności od przeglądarki i Angulara.
3. `src/app/match/match-store.ts` — stan interfejsu oparty na Signals.
4. `src/game/renderer/appearance.ts` i `board-renderer.ts` — katalog wyglądu, rysowanie siatki i cykl życia PixiJS. Renderowanie nie zmienia stanu gry.
5. `src/app/board/board.ts` — komponent Angulara, leniwe ładowanie renderera, sprzątanie i błędy.
6. `src/app/app.ts`, `app.html`, `app.css` — ekran areny.

Testy znajdują się obok kodu, w plikach `.spec.ts`.

## Stack i granice

Angular **22.2.2**, PixiJS **8.22.0**, TypeScript **6.0.3**, Vitest **5.0.4**. Dokładne zależności zapisano w `package.json` i `package-lock.json`. Standalone, domyślne w Angularze 22 OnPush i zoneless, `signal`, `computed` oraz signal inputs; bez Zone.js. Signal Forms będą używane, gdy powstaną formularze.

Silnik nie importuje Angulara ani PixiJS. UI czyta stan przez store, a renderer tylko go prezentuje. PixiJS ładuje się osobno i w tej fazie rysuje raz, bez ciągłej pętli animacji. `@xmldom/xmldom` na liście `allowedCommonJsDependencies` jest zależnością PixiJS; wpis jawnie akceptuje jej format modułu, bez zmiany reguł gry.

Repozytorium utworzono przez Angular CLI, zgodnie z oficjalnymi [skillami Angulara](https://angular.dev/ai/agent-skills). Katalogi `strategy`, `runtime` i pliki strategii powstaną w odpowiednich fazach, bez pustych implementacji wyprzedzających plan.

- [Plan faz](docs/PLAN-IMPLEMENTACJI.md)
- [Wymagania MVP](docs/WYMAGANIA-MVP.md)
- [Stack i infrastruktura](docs/STACK-I-INFRA.md)
- [API strategii](docs/API-STRATEGII.md)
- [Odbiór całego MVP](docs/ODBIOR-MVP.md)

Po każdej fazie zatrzymujemy się na przegląd użytkownika. Commit, push i ręczna publikacja wymagają osobnego polecenia.
