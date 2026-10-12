# API strategii MVP.0

Status: zatwierdzony kontrakt główny; poniższe nazwy pól i konwencje doprecyzowują go na potrzeby implementacji. Stack nie jest wybrany.

## Strategia i stan

Strategia udostępnia synchroniczną funkcję `onTick(state, api)`. Format eksportu pliku określimy przy wyborze stacku. Brak asynchronicznych akcji gry.

`state` jest odczytywalną migawką początku kroku, wspólną czasowo dla obu graczy. Akcje nie aktualizują tej migawki; aktualny rezultat własnej akcji jest dostępny w jej wartości zwrotnej.

| Pole | Znaczenie |
|---|---|
| `tick` | Numer kroku, od 0 |
| `time` | Czas symulacji w sekundach, wyliczony jako `tick × config.simulation.stepSeconds` |
| `config` | Centralna konfiguracja meczu, tylko do odczytu |
| `self`, `opponent` | Dane odpowiedniego gracza |

`time` jest wygodną wartością pochodną numeru kroku, a nie zegarem rzeczywistym. Przy kroku 0,1 s tick 100 zawsze oznacza 10 s symulacji, niezależnie od prędkości odtwarzania. Przyspieszenie zmienia liczbę kroków wykonywanych w sekundzie rzeczywistej; pominięcie animacji wykonuje te same kroki bez renderowania. Silnik nie opiera ekonomii, ruchu ani ataków na czasie klatek. Pole `time` nie jest konieczne do obliczeń, ale ułatwia pisanie strategii.

Dane gracza: `id`, `gold`, `leaks`, `mobLevels` (poziom każdego produkowanego typu), `board` (`width`, `height`, `entry`, `base`), `towers`, `mobs`, `outgoingMobs`.

`towers` to własne wieże danego gracza. `mobs` to moby obecne na jego polu obrony, czyli wysłane przez przeciwnika. `outgoingMobs` to własne żywe moby wysłane na pole przeciwnika, z pełnymi statystykami i pozycjami. `state.self.outgoingMobs.length` daje ich liczbę. Ich współrzędne odnoszą się do pola przeciwnika. To alternatywny widok tych samych jednostek, które występują w `state.opponent.mobs`, a nie dodatkowe jednostki. Analogiczna zasada dotyczy przeciwnika. Tablice są uporządkowane według ID.

Wieża: `id`, `type`, `level`, `x`, `y`, `damage`, `range`, `attackInterval`, `cooldownRemaining`, `totalSpent`.

Mob: `id`, `ownerId`, `type`, `level`, `x`, `y`, `hp`, `maxHp`, `speed`, `reward`, `remainingDistance`. Pozycja moba może być ułamkowa podczas ruchu między polami; dystans to pozostała długość trasy w jednostkach pola.

ID są unikalnymi liczbami całkowitymi w meczu, nadawanymi deterministycznie; nowy mecz resetuje licznik. Statystyki mobów są ustalone w chwili produkcji.

## Akcje

| Wywołanie | Efekt | Sukces |
|---|---|---|
| `buildTower(type, x, y)` | Budowa na własnym polu; całkowite współrzędne | `{ ok: true, towerId }` |
| `upgradeTower(towerId)` | Podniesienie poziomu własnej wieży o jeden | `{ ok: true, towerId, level }` |
| `sellTower(towerId)` | Usunięcie własnej wieży i zwrot złota | `{ ok: true, towerId, refund }` |
| `spawnMob(type)` | Produkcja moba na wejściu pola przeciwnika | `{ ok: true, mobId }` |
| `upgradeMob(type)` | Podniesienie poziomu produkcji danego typu o jeden | `{ ok: true, type, level }` |

Typy wież: `basic`, `splash`. Typy mobów: `basic`, `heavy`.

Akcje są synchroniczne, wykonywane w kolejności wywołań i rozliczane względem aktualnego złota oraz zmian wykonanych wcześniej w tym kroku. Nieudana akcja nie pobiera zasobów ani nie zmienia stanu gry.

Błąd: `{ ok: false, error }`. Katalog:

| Kod | Przyczyna |
|---|---|
| `INVALID_ARGUMENT` | Niepoprawny format argumentów |
| `UNKNOWN_TYPE` | Nieznany typ jednostki |
| `OUT_OF_BOUNDS` | Pole poza planszą |
| `RESERVED_CELL` | Wejście lub baza |
| `CELL_OCCUPIED` | Wieża lub mob na wskazanym polu |
| `PATH_BLOCKED` | Odcięcie wejścia lub żywego moba od bazy |
| `INSUFFICIENT_GOLD` | Brak złota |
| `TOWER_NOT_FOUND` | Brak własnej wieży o podanym ID |
| `MAX_LEVEL` | Jednostka lub produkcja osiągnęła poziom 3 |

`api.memory` jest osobnym mutowalnym obiektem każdego gracza, początkowo `{}`. Przetrwa kroki i pauzę, ale nie restart meczu ani odświeżenie.

`api.log(message)` zapisuje tekst z numerem kroku i czasem w logu gracza. Nie jest akcją ekonomiczną.

## Konwencje symulacji

- Kierunki przy równych trasach: prawo, dół, lewo, góra. Parametr centralnej konfiguracji.
- Środki pól mają współrzędne całkowite. Moby poruszają się między środkami, po jednej krawędzi naraz.
- Przy budowie pole zajęte przez moba między środkami obejmuje oba końce aktualnej krawędzi. Nie można zbudować wieży na żadnym z nich. Po zmianie mapy mob kończy aktualną krawędź, następnie wybiera nową trasę.
- Przy kroku 0 nie doliczamy przychodu. Następnie każdy krok dodaje przychód za 0,1 s, przygotowuje migawki, wywołuje strategie, rozstrzyga jednoczesne ataki, usuwa zabite moby i przyznaje nagrody, przesuwa żywe moby oraz sprawdza próg przegranej obu graczy.
- Ataki używają pozycji przed ruchem; obrażenia ze wszystkich ataków sumują się przed usunięciem mobów. Obrażenia obszarowe obejmują też cel główny.
- Cooldown jest liczony w czasie symulacji. Nowa wieża ma cooldown 0. Gotowa wieża bez celu pozostaje gotowa.
- Złoto może mieć część ułamkową, również po sprzedaży. Zaokrąglenie prezentacji nie zmienia salda.
- Strategie używające stanu i API mają powtarzalne wyniki. Bezpośrednie użycie losowości/zegara JavaScript wykracza poza tę gwarancję.

Konwencje dotyczące nazw pól, kolejności kierunków i ruchu między środkami są doprecyzowaniem implementacyjnym; można je skorygować przed implementacją bez zmiany zakresu produktu.
