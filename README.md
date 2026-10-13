# Code Tower Defense

Programowalne tower defense: dwa skrypty JavaScript będą rozgrywać lokalny pojedynek w jednej przeglądarce.

**Faza 5 + balans B2 — gotowe do przeglądu.** Dwa pliki JavaScript rozgrywają pełny mecz przez `onTick(state, api)`. Działają wszystkie akcje, migawki tylko do odczytu, osobna pamięć i logi oraz wynik błędu strategii. Przykłady kończą mecz zwycięstwem gracza 1 po 32,2 s symulacji.

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
npm run balance -- --profile=active --limit=300 # 25 pojedynków bez grafiki
```

Testy obejmują inicjalizację i niezależność stanu meczu, przekazywanie konfiguracji, integrację widoku z rendererem, zwalnianie zasobów, błąd inicjalizacji grafiki i dostępność HTML przez axe-core. Test axe działa w jsdom, bez reguły kontrastu, która wymaga prawdziwego renderowania. Testy fazy 2 obejmują też trasowanie, zakręty, nakładanie się mobów, remisy i zwycięstwa, pauzę/reset, przyciski UI i identyczny stan końcowy przy różnych prędkościach oraz nieregularnych klatkach. Rzeczywisty obraz PixiJS wymaga także przeglądu w przeglądarce; status sprawdzeń znajduje się w raporcie odbioru fazy.

## Odbiór fazy 5

1. Kliknij **Start**. Gracz 1 prowadzi „Adaptacyjny kontratak”, gracz 2 „Ciężkie fale”. Nazwy strategii są widoczne przy planszach; własne decyzje zapisują do oddzielnych logów.
2. Obie strategie budują ściany z naprzemiennymi przejściami i przeznaczają 60% przychodu na produkcję. Linia pokazuje bieżącą najkrótszą trasę. Przychód rośnie po zakupach (do 90 G/s), a moby wchodzą co 0,2 s. Licznik „W kolejce” pokazuje oczekujące jednostki.
3. Przykłady przy domyślnej konfiguracji kończą się **wygraną gracza 1 po 32,2 s** (około 8 s przy 4×). Liczniki przepuszczeń wynoszą **1 i 20**.
4. Sprawdź pauzę, wznowienie i zmianę prędkości. **Nowy mecz** resetuje jednostki, złoto, czas, ID, logi i `api.memory`; prędkość pozostaje ustawieniem odtwarzania.
5. Otwórz `src/strategies/player-one.js`, zmień wybór polityki; parametry fal i plan ścian znajdują się w `src/strategies/tactics.js`, zapisz i **przeładuj stronę**. Start uruchomi zmieniony kod. Zmiana kodu podczas meczu nie jest obsługiwana; rozpocznij nową rozgrywkę po przeładowaniu.
6. Aby sprawdzić obsługę błędu, dodaj w `onTick` gracza 2: `if (state.tick === 10) throw new Error('Test strategii');`. Po sekundzie pojawi się „Błąd strategii gracza 2 — bez zwycięzcy” z komunikatem. Cofnij zmianę, przeładuj stronę i uruchom nowy mecz.

Kod strategii ma pełny wgląd w oba pola i konfigurowalne parametry, lecz obserwacje są zamrożone. Używaj wyników akcji do sprawdzania bieżących zakupów: `state.self.gold` nie zmienia się w trakcie pojedynczego wywołania. Przechowuj stan w `api.memory['klucz']`, aby pauza go zachowała, a nowy mecz wyczyścił.

Format eksportu, przykłady i pełne API: [API strategii](docs/API-STRATEGII.md). Każdy plik eksportuje `name` i synchroniczne `onTick`. JSDoc w przykładach zapewnia sprawdzanie typów i podpowiedzi bez zmiany języka na TypeScript.

## Kolejność przeglądu kodu fazy 5

1. `src/strategies/player-one.js`, `player-two.js` i `tactics.js` — strategie, budżety i ściany labiryntu.
2. `src/game/config/game-config.ts`, `engine/actions.ts`, `economy.ts`, `combat.ts` i `spawning.ts` — balans, bonusy produkcji, limit wybuchu i kolejka wejścia.
3. `src/game/strategy/contracts.ts` — stan publiczny i sygnatury API.
4. `src/game/strategy/snapshot.ts` — wspólna czasowo, sklonowana i zamrożona obserwacja oraz `outgoingMobs`.
5. `src/game/strategy/strategy-api.ts` — synchroniczne akcje przypisane do gracza, pamięć i logowanie.
6. `src/game/strategy/strategy-runtime.ts` — wykonanie obu strategii, pamięć, reset, wyjątki i zakaz opóźnionych akcji.
7. `src/game/runtime/match-session.ts` i `engine/step.ts` — integracja strategii z walką i ruchem; timery są aktualizowane przed kolejną obserwacją.
8. `src/app/match/match-store.ts` i `match-controls/match-controls.ts` — nazwy, sterowanie, wynik i komunikat błędu.

Testy są obok kodu. Obejmują wspólny stan początku kroku, brak mutacji silnika przez obserwacje, wszystkie akcje, pamięć między krokami i przy pauzie, pełny reset, błędy obu graczy i identyczny końcowy stan przy różnych prędkościach.

## Stack i granice

Angular **22.2.2**, PixiJS **8.22.0**, TypeScript **6.0.3**, Vitest **5.0.4**. Dokładne zależności zapisano w `package.json` i `package-lock.json`. Standalone, domyślne w Angularze 22 OnPush i zoneless, `signal`, `computed` oraz signal inputs; bez Zone.js. Signal Forms będą używane, gdy powstaną formularze.

Silnik nie importuje Angulara ani PixiJS. UI czyta stan przez store, a renderer tylko go prezentuje. PixiJS ładuje się osobno i odrysowuje moby oraz wieże po zmianie stanu. Siatka jest tworzona raz. Ticker PixiJS działa podczas lotu i eksplozji, a przy pauzie zatrzymuje się; nie prowadzi symulacji gry. `@xmldom/xmldom` na liście `allowedCommonJsDependencies` jest zależnością PixiJS; wpis jawnie akceptuje jej format modułu, bez zmiany reguł gry.

Repozytorium utworzono przez Angular CLI, zgodnie z oficjalnymi [skillami Angulara](https://angular.dev/ai/agent-skills). Katalog `runtime` prowadzi mecz, a `strategy` wykonuje skrypty i udostępnia im API. Stary scenariusz demonstracyjny został zastąpiony strategiami.

- [Balans B2 i kolejka](docs/BALANS-B2.md)
- [Odbiór fazy 5](docs/ODBIOR-FAZY-5.md)
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
