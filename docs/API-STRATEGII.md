# API strategii MVP.0

Status: kontrakt zaimplementowany w fazie 5. Aktualizacja: 2026-10-13. Strategie są modułami JavaScript dołączanymi przez Angular CLI.

## Pliki i format eksportu

Strategie są w `src/strategies/player-one.js` i `src/strategies/player-two.js`. Aplikacja importuje je statycznie; zmiana pliku i pełne przeładowanie strony uruchamia nowy kod. Wersja wdrożona korzysta ze skryptów dołączonych do buildu. Edytor w przeglądarce pozostaje w MVP.1.

```js
export const name = 'Moja strategia';

/**
 * @param {import('../game/strategy/contracts').StrategyState} state
 * @param {import('../game/strategy/contracts').StrategyApi} api
 */
export function onTick(state, api) {
  if (!api.memory['initialized']) {
    const tower = api.buildTower('basic', 4, 5);
    if (tower.ok) api.memory['towerId'] = tower.towerId;
    else api.log(`Budowa odrzucona: ${tower.error}`);
    api.memory['initialized'] = true;
  }
  if (state.tick % 20 === 0) {
    const mob = api.spawnMob('basic');
    if (mob.ok) api.log(`Wyprodukowano moba #${mob.mobId}`);
  }
}
```

JSDoc daje podpowiedzi API i sprawdzanie typów JavaScript przez `npm run typecheck`. Dla dowolnych kluczy pamięci stosujemy zapis `api.memory['klucz']`, zgodny z konfiguracją sprawdzania typów projektu.

## Strategia i stan

Strategia udostępnia synchroniczną funkcję `onTick(state, api)`. Każdy plik eksportuje `onTick` oraz tekstową nazwę `name`. Brak asynchronicznych akcji gry.

`state` jest odczytywalną migawką początku kroku, wspólną czasowo dla obu graczy. Akcje nie aktualizują tej migawki; aktualny rezultat własnej akcji jest dostępny w jej wartości zwrotnej. Oba widoki są przygotowane przed wywołaniem pierwszej strategii, sklonowane i zamrożone rekurencyjnie. Próba modyfikacji obserwacji może rzucić wyjątek, obsługiwany jako błąd strategii; nie zmieni silnika.

| Pole               | Znaczenie                                                                         |
| ------------------ | --------------------------------------------------------------------------------- |
| `tick`             | Numer kroku, od 0                                                                 |
| `time`             | Czas symulacji w sekundach, wyliczony jako `tick × config.simulation.stepSeconds` |
| `config`           | Centralna konfiguracja meczu, tylko do odczytu                                    |
| `self`, `opponent` | Dane odpowiedniego gracza                                                         |

`time` jest wygodną wartością pochodną numeru kroku, a nie zegarem rzeczywistym. Przy kroku 0,1 s tick 100 zawsze oznacza 10 s symulacji, niezależnie od prędkości odtwarzania. Przyspieszenie zmienia liczbę kroków wykonywanych w sekundzie rzeczywistej; pominięcie animacji wykonuje te same kroki bez renderowania. Silnik nie opiera ekonomii, ruchu ani ataków na czasie klatek. Pole `time` nie jest konieczne do obliczeń, ale ułatwia pisanie strategii.

Dane gracza: `id`, `gold`, `income`, `leaks`, `mobLevels` (poziom każdego produkowanego typu), `board` (`width`, `height`, `entry`, `base`), `towers`, `mobs`, `outgoingMobs`, `queuedMobs`, `outgoingQueue`.

`towers` to własne wieże danego gracza. `mobs` to moby obecne na jego polu obrony, czyli wysłane przez przeciwnika. `outgoingMobs` to własne żywe moby wysłane na pole przeciwnika, z pełnymi statystykami i pozycjami. `state.self.outgoingMobs.length` daje ich liczbę. Ich współrzędne odnoszą się do pola przeciwnika. To alternatywny widok tych samych jednostek, które występują w `state.opponent.mobs`, a nie dodatkowe jednostki. Analogiczna zasada dotyczy przeciwnika. Tablice są uporządkowane według ID.

`income` to aktualny łączny przychód G/s: bazowo 30, +0,2 za zakup `basic`, +0,6 za `heavy`, maksymalnie 90. Bonus zostaje po śmierci lub przepuszczeniu moba. Zakup w ticku 0 daje bonus, ale pierwsza wypłata następuje w ticku 1. Nieudany zakup i ulepszenie nie dają bonusu.

`queuedMobs` to zakupione jednostki przeciwnika oczekujące na wejście na własną planszę. `outgoingQueue` udostępnia własne jednostki w kolejce przeciwnika. Kolejki zachowują kolejność zakupów. Statystyki i ID są ustalone przy zakupie; jednostki czekające nie poruszają się i nie są celami wież. Nie należą jeszcze do `mobs` ani `outgoingMobs`. Zwrócenie `mobId` oznacza udany zakup, także kiedy mob musi poczekać.

Pierwszy mob wchodzi od razu, jeśli wejście jest gotowe. Kolejni wchodzą co `config.simulation.mobSpawnIntervalSeconds` (domyślnie 0,2 s, dwa kroki). Złoto oraz bonus przychodu rozliczane są od razu za każdą sztukę. Każdy gracz ma osobną kolejkę. Pauza zatrzymuje odstępy, nowy mecz usuwa kolejki. Prędkość odtwarzania nie zmienia odstępów w czasie symulacji. Moby nadal mogą przenikać i wyprzedzać się; to rozłożenie wejść w czasie, bez kolizji.

Wieża: `id`, `type`, `level`, `x`, `y`, `damage`, `range`, `attackInterval`, `cooldownRemaining`, `totalSpent`.

Mob: `id`, `ownerId`, `type`, `level`, `x`, `y`, `hp`, `maxHp`, `speed`, `reward`, `remainingDistance`. Pozycja moba może być ułamkowa podczas ruchu między polami; dystans to pozostała długość trasy w jednostkach pola.

ID są unikalnymi liczbami całkowitymi w meczu, nadawanymi deterministycznie; nowy mecz resetuje licznik. Statystyki mobów są ustalone w chwili produkcji.

## Akcje

| Wywołanie                | Efekt                                              | Sukces                          |
| ------------------------ | -------------------------------------------------- | ------------------------------- |
| `buildTower(type, x, y)` | Budowa na własnym polu; całkowite współrzędne      | `{ ok: true, towerId }`         |
| `upgradeTower(towerId)`  | Podniesienie poziomu własnej wieży o jeden         | `{ ok: true, towerId, level }`  |
| `sellTower(towerId)`     | Usunięcie własnej wieży i zwrot złota              | `{ ok: true, towerId, refund }` |
| `spawnMob(type)`         | Zakup moba do kolejki wejścia na pole przeciwnika  | `{ ok: true, mobId }`           |
| `upgradeMob(type)`       | Podniesienie poziomu produkcji danego typu o jeden | `{ ok: true, type, level }`     |

Typy wież: `basic`, `splash`. Typy mobów: `basic`, `heavy`.

Akcje są synchroniczne, wykonywane w kolejności wywołań i rozliczane względem aktualnego złota oraz zmian wykonanych wcześniej w tym kroku. Nieudana akcja nie pobiera zasobów ani nie zmienia stanu gry.

Błąd: `{ ok: false, error }`. Katalog:

| Kod                 | Przyczyna                                  |
| ------------------- | ------------------------------------------ |
| `INVALID_ARGUMENT`  | Niepoprawny format argumentów              |
| `UNKNOWN_TYPE`      | Nieznany typ jednostki                     |
| `OUT_OF_BOUNDS`     | Pole poza planszą                          |
| `RESERVED_CELL`     | Wejście lub baza                           |
| `CELL_OCCUPIED`     | Wieża lub mob na wskazanym polu            |
| `PATH_BLOCKED`      | Odcięcie wejścia lub żywego moba od bazy   |
| `INSUFFICIENT_GOLD` | Brak złota                                 |
| `TOWER_NOT_FOUND`   | Brak własnej wieży o podanym ID            |
| `MAX_LEVEL`         | Jednostka lub produkcja osiągnęła poziom 3 |

`api.memory` jest osobnym mutowalnym obiektem każdego gracza, początkowo `{}`. Przetrwa kroki i pauzę, ale nie restart meczu ani odświeżenie.

`api.log(message)` zapisuje `String(message)` z numerem kroku i czasem w logu własnego gracza. Nie jest akcją ekonomiczną. Logi są resetowane przy nowym meczu; wpisy o zabiciach i nagrodach dodaje również silnik.

## Pamięć, wyniki i błędy

- Obaj gracze mają odrębne obiekty `api.memory`. Zapisuj w nich stan strategii zamiast w zmiennych modułu, jeśli ma być resetowany przy nowym meczu. Pamięć może zawierać dowolne wartości JavaScript, także obiekty i funkcje.
- Aktualne saldo rozliczeniowe może się różnić od `state.self.gold`, jeśli wcześniej w tym wywołaniu wykonano zakup. Każda akcja rozlicza aktualny stan i zwraca sukces lub błąd. Błąd akcji pozwala kontynuować `onTick`.
- API akcji i logowania działa wyłącznie w synchronicznym wywołaniu `onTick`. Nie używaj `async`, Promise, timerów ani zachowanego API do późniejszych akcji. Zwrot Promise kończy mecz czytelnym błędem.
- Wyjątek kończy mecz jako `strategy-error`, ze wskazaniem `playerId` i komunikatu, bez zwycięzcy. Akcje wykonane przed wyjątkiem pozostają w stanie końcowym; dalsza walka i ruch tego kroku nie odbywają się.
- Przerwanie, zakończenie i błąd zatrzymują wywołania. Pauza zachowuje pamięć. Nowy mecz resetuje cały stan, logi i pamięć, zachowując funkcje strategii i konfigurację.
- Strategie w MVP.0 są zaufanym kodem repozytorium. Izolacja i walidacja niezaufanego kodu pozostają poza MVP.0.

## Konwencje symulacji

- Kierunki przy równych trasach: prawo, dół, lewo, góra. Parametr centralnej konfiguracji.
- Środki pól mają współrzędne całkowite. Moby poruszają się między środkami, po jednej krawędzi naraz.
- Przy budowie pole zajęte przez moba między środkami obejmuje oba końce aktualnej krawędzi. Nie można zbudować wieży na żadnym z nich. Po zmianie mapy mob kończy aktualną krawędź, następnie wybiera nową trasę.
- Przy kroku 0 nie doliczamy przychodu. Następnie każdy krok dodaje przychód za 0,1 s, przygotowuje migawki, wywołuje strategie, rozstrzyga jednoczesne ataki, usuwa zabite moby i przyznaje nagrody, przesuwa żywe moby oraz sprawdza próg przegranej obu graczy.
- Ataki używają pozycji przed ruchem; obrażenia ze wszystkich ataków sumują się przed usunięciem mobów. Wybuch obejmuje maksymalnie sześć żywych mobów w promieniu 1,5: zawsze cel główny, następnie najbliższe jednostki; remis odległości rozstrzyga niższe ID. Każda wieża wybiera ofiary przed nałożeniem jakichkolwiek obrażeń.
- Cooldown jest liczony w czasie symulacji. Nowa wieża ma cooldown 0. Gotowa wieża bez celu pozostaje gotowa.
- Złoto może mieć część ułamkową, również po sprzedaży. Zaokrąglenie prezentacji nie zmienia salda.
- Strategie używające stanu i API mają powtarzalne wyniki. Bezpośrednie użycie losowości/zegara JavaScript wykracza poza tę gwarancję.

Start przygotowuje wywołania i walkę przy ticku 0 i czasie 0. Odtworzenie kolejnych 0,1 s kończy ruch przygotowanego kroku, sprawdza wynik, a gdy mecz trwa, przygotowuje kolejny krok: timery, wypuszczenie kolejnego moba z kolejki, przychód, migawki, strategie i walkę. Dzięki temu obserwacje widzą aktualne pozycje, saldo i cooldown przed swoimi akcjami. Wybór celów i obrażenia pozostają przed ruchem danego kroku.
