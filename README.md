# Code Tower Defense

Programowalne tower defense: dwa skrypty JavaScript będą rozgrywać lokalny pojedynek w jednej przeglądarce.

**Faza 3 — implementacja gotowa do przeglądu.** Demo korzysta z prawdziwych kosztów, przychodu, produkcji dwóch typów mobów oraz budowy i sprzedaży wież. Wieże zmieniają trasy; błędy akcji i sprzedaż są widoczne w osobnych logach. Walka i ulepszenia powstaną w fazie 4, a strategie JavaScript w fazie 5.

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

## Odbiór fazy 3

1. Przed startem obie strony mają 200 G i puste plansze. Kliknij **Start**: każda strona buduje basic `(4, 6)` za 50 G i splash `(8, 6)` za 100 G oraz produkuje moba podstawowego za 20 G. Saldo wynosi 30 G, czas pozostaje 0 s do pierwszego kroku ruchu.
2. W logach są także odrzucone próby: budowa na wejściu (`RESERVED_CELL`), na istniejącej wieży (`CELL_OCCUPIED`) oraz zakup splash przy niedostatecznym saldzie (`INSUFFICIENT_GOLD`). Nie pobierają złota.
3. Wybierz **4×**, aby szybciej obejrzeć scenariusz. Ściana w kolumnie 4 rośnie co 8 s czasu symulacji, a moby obchodzą ją najkrótszą dostępną drogą. Podstawowe moby są okrągłe, ciężkie kwadratowe. Każda trzecia produkcja jest ciężka.
4. W **88 s** ostatnia próba zamknięcia ściany zostaje odrzucona jako `PATH_BLOCKED`. Pozostaje droga przez wiersz 0.
5. W **92 s** wieża `(4, 6)` zostaje sprzedana, z logiem zwrotu **25 G**. Trasy skracają się, a moby w ruchu kończą aktualną krawędź, zanim wybiorą nowy kierunek.
6. Kliknij **Pauza**: przychód, ruch i akcje zatrzymują się. **Wznów** kontynuuje. **Przerwij** kończy bez zwycięzcy, także podczas pauzy.
7. Pełna demonstracja kończy się **remisem po 160,5 s** czasu symulacji (około 40 s przy 4×), z 20 przepuszczeniami na stronę. **Nowy mecz** resetuje jednostki, saldo, logi, ID i czas; wybrana prędkość pozostaje ustawieniem odtwarzania.

Oba logi pokazują pełną historię, od najnowszych wpisów; starsze wpisy można przewinąć. Wieże basic mają kwadratowy fundament, splash kształt rombu. W tej fazie są przeszkodami i jeszcze nie atakują.

Parametry gry i ekonomii są w `src/game/config/game-config.ts`; harmonogram demonstracji w `demo-config.ts`. Możesz zmienić parametry i uruchomić nowy mecz po przeładowaniu aplikacji. Demo ma domyślne pozycje dla mapy 16 × 12; zmiana rozmiaru mapy może wymagać zmiany jego harmonogramu i współrzędnych.

## Kolejność przeglądu kodu fazy 3

1. `src/game/engine/model.ts` — wieże, moby i logi.
2. `src/game/engine/placement.ts` — zajętość pól, drożność od wejścia i każdego żywego moba.
3. `src/game/engine/actions.ts` — synchroniczne wyniki budowy, sprzedaży i produkcji. Sukces zwraca nowy stan i ID; błąd zachowuje poprzedni stan.
4. `src/game/engine/economy.ts`, `step.ts` i `runtime/match-session.ts` — początkowe akcje przy czasie 0, następnie ruch w stałych odstępach oraz przychód przed akcjami kolejnego kroku. Dziesięć kroków bez wydatków daje 10 G przychodu.
5. `src/game/runtime/demo.ts` — scenariusz korzystający z tych samych akcji i zapisujący wyniki do logów.
6. `src/game/renderer/units-layer.ts` i `src/app/player-log/player-log.ts` — prezentacja jednostek i logów.

Testy są obok kodu. Obejmują koszty i zwroty, atomowość błędów, współdzielony licznik ID, drożność dla mobów i wejścia, oba końce zajętej krawędzi, zmianę tras bez teleportacji, deterministyczny wynik i sterowanie interfejsem.

## Stack i granice

Angular **22.2.2**, PixiJS **8.22.0**, TypeScript **6.0.3**, Vitest **5.0.4**. Dokładne zależności zapisano w `package.json` i `package-lock.json`. Standalone, domyślne w Angularze 22 OnPush i zoneless, `signal`, `computed` oraz signal inputs; bez Zone.js. Signal Forms będą używane, gdy powstaną formularze.

Silnik nie importuje Angulara ani PixiJS. UI czyta stan przez store, a renderer tylko go prezentuje. PixiJS ładuje się osobno i odrysowuje moby oraz wieże po zmianie stanu. Siatka jest tworzona raz; renderer nie prowadzi własnej symulacji. `@xmldom/xmldom` na liście `allowedCommonJsDependencies` jest zależnością PixiJS; wpis jawnie akceptuje jej format modułu, bez zmiany reguł gry.

Repozytorium utworzono przez Angular CLI, zgodnie z oficjalnymi [skillami Angulara](https://angular.dev/ai/agent-skills). Katalog `runtime` obsługuje już demonstrację. Katalog `strategy` i pliki strategii powstaną w fazie 5.

- [Odbiór fazy 3](docs/ODBIOR-FAZY-3.md)
- [Odbiór fazy 2](docs/ODBIOR-FAZY-2.md)
- [Odbiór fazy 1](docs/ODBIOR-FAZY-1.md)
- [Plan faz](docs/PLAN-IMPLEMENTACJI.md)
- [Wymagania MVP](docs/WYMAGANIA-MVP.md)
- [Stack i infrastruktura](docs/STACK-I-INFRA.md)
- [API strategii](docs/API-STRATEGII.md)
- [Odbiór całego MVP](docs/ODBIOR-MVP.md)

Po każdej fazie zatrzymujemy się na przegląd użytkownika. Commit, push i ręczna publikacja wymagają osobnego polecenia.
