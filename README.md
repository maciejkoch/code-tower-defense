# Code Tower Defense

Programowalne tower defense: dwa skrypty JavaScript będą rozgrywać lokalny pojedynek w jednej przeglądarce.

**Faza 4 — implementacja gotowa do przeglądu.** Wieże strzelają lecącymi pociskami, moby mają paski zdrowia, a wieże oznaczenia poziomów. Działają obrażenia obszarowe, jednoczesne trafienia, nagrody za zabicia i oba rodzaje ulepszeń. Strategie JavaScript z `onTick(state, api)` powstaną w fazie 5.

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

## Odbiór fazy 4

1. Kliknij **Start** przy prędkości **1×** lub **0.5×**. Każdy gracz buduje basic `(4, 6)` i splash `(8, 6)`, a na obu polach pojawia się mob przeciwnika. Złoto po pierwszych zakupach wynosi 30 G.
2. Po wejściu moba w zasięg wieży zobaczysz **lecący pocisk**. Podstawowa wieża trafia jeden cel; pocisk obszarowy kończy się rozszerzającą eksplozją. Paski zdrowia maleją, zabite moby znikają, a log obrońcy pokazuje przyznaną nagrodę.
3. Sprawdź **Pauza/Wznów** w trakcie lotu pocisku. Pauza zatrzymuje zarówno symulację, jak i animację. Prędkości 0,5×–4× zmieniają tempo obu warstw, zachowując wynik meczu.
4. W **12 i 24 s** basic rośnie do poziomów 2 i 3. W **48 i 72 s** to samo dzieje się ze splash. Małe znaczniki pod wieżą pokazują jej poziom. Próba kolejnego ulepszenia basic w **60 s** zwraca `MAX_LEVEL`.
5. W **16, 32 i 96 s** powstają grupy po trzy moby podstawowe; pozwalają obserwować wspólne trafienia obszarowe.
6. Produkcja ciężkich mobów rośnie w **88 s** do poziomu 2, a w **144 s** do poziomu 3. Ciężki mob wyprodukowany w **92 s** ma 225 HP, a w **148 s** ma 300 HP. Starsze moby zachowują swoje statystyki.
7. W **160 s** demo sprzedaje obie wieże poziomu 3. Zwroty wynoszą **87,5 G** za basic i **175 G** za splash. Następnie regularne moby przechodzą do baz.
8. Przy domyślnej konfiguracji mecz kończy się **remisem po 185,5 s** (około 46 s przy 4×), z po 20 przepuszczeń. Sprawdź także przerwanie podczas pauzy i reset przez **Nowy mecz**.

Obrażenia są rozstrzygane natychmiast w kroku gry; lot pocisku i eksplozja są prezentacją tego trafienia. Dlatego zdrowie może zmienić się przed wizualnym dotarciem pocisku. Animacja podąża za żyjącym celem i nie wykonuje żadnych obliczeń obrażeń. Parametry lotu znajdują się w katalogu wyglądu, niezależnie od reguł walki.

Scenariusz zakupów jest w `src/game/config/demo-config.ts`, zasady i balans w `game-config.ts`, a wygląd w `renderer/appearance.ts`. Wszystkie zakupy i ulepszenia w demo są finansowane z salda; nie przyznajemy dodatkowego złota na potrzeby demonstracji.

## Kolejność przeglądu kodu fazy 4

1. `src/game/engine/combat.ts` — cel według pozostałej drogi i ID, zasięg w linii prostej, cooldown, jednoczesne obrażenia, śmierć i pojedyncza nagroda.
2. `src/game/engine/actions.ts` — `upgradeTower` i `upgradeMob`: koszty, limity, zachowanie cooldownu i statystyki kolejnych mobów.
3. `src/game/engine/step.ts` i `runtime/match-session.ts` — przygotowanie ataków po akcjach obu stron, przed ruchem; zabite moby nie mogą dotrzeć do bazy.
4. `src/game/engine/events.ts` — dane o rozstrzygniętych strzałach, przeznaczone dla prezentacji.
5. `src/game/renderer/projectiles.ts`, `effects-layer.ts`, `board-renderer.ts` — lot, eksplozja, deduplikacja zdarzeń, pauza i cykl życia animacji PixiJS.
6. `src/game/renderer/units-layer.ts` — zdrowie i znaczniki poziomu.
7. `src/game/runtime/demo.ts` — harmonogram walki i ulepszeń, zastępowany strategiami w fazie 5.

Testy są obok kodu. Obejmują wybór celu i remis ID, zasięg i promień obszarowy, jednoczesne trafienia, nagrody, cooldown, nową wieżę i nowego moba w tym samym kroku, koszty i poziomy ulepszeń, statystyki istniejących mobów, sprzedaż po ulepszeniu, animacje oraz powtarzalność pełnego meczu.

## Stack i granice

Angular **22.2.2**, PixiJS **8.22.0**, TypeScript **6.0.3**, Vitest **5.0.4**. Dokładne zależności zapisano w `package.json` i `package-lock.json`. Standalone, domyślne w Angularze 22 OnPush i zoneless, `signal`, `computed` oraz signal inputs; bez Zone.js. Signal Forms będą używane, gdy powstaną formularze.

Silnik nie importuje Angulara ani PixiJS. UI czyta stan przez store, a renderer tylko go prezentuje. PixiJS ładuje się osobno i odrysowuje moby oraz wieże po zmianie stanu. Siatka jest tworzona raz. Ticker PixiJS działa podczas lotu i eksplozji, a przy pauzie zatrzymuje się; nie prowadzi symulacji gry. `@xmldom/xmldom` na liście `allowedCommonJsDependencies` jest zależnością PixiJS; wpis jawnie akceptuje jej format modułu, bez zmiany reguł gry.

Repozytorium utworzono przez Angular CLI, zgodnie z oficjalnymi [skillami Angulara](https://angular.dev/ai/agent-skills). Katalog `runtime` obsługuje już demonstrację. Katalog `strategy` i pliki strategii powstaną w fazie 5.

- [Odbiór fazy 4](docs/ODBIOR-FAZY-4.md)
- [Odbiór fazy 3](docs/ODBIOR-FAZY-3.md)
- [Odbiór fazy 2](docs/ODBIOR-FAZY-2.md)
- [Odbiór fazy 1](docs/ODBIOR-FAZY-1.md)
- [Plan faz](docs/PLAN-IMPLEMENTACJI.md)
- [Wymagania MVP](docs/WYMAGANIA-MVP.md)
- [Stack i infrastruktura](docs/STACK-I-INFRA.md)
- [API strategii](docs/API-STRATEGII.md)
- [Odbiór całego MVP](docs/ODBIOR-MVP.md)

Po każdej fazie zatrzymujemy się na przegląd użytkownika. Commit, push i ręczna publikacja wymagają osobnego polecenia.
