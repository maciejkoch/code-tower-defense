# Programowalne Tower Defense — wymagania MVP

Status: wymagania funkcjonalne MVP.0 zatwierdzone; szczegóły kontraktu API opisane w API-STRATEGII.md. Ostatnia aktualizacja: 2026-10-12.
Dokument jest źródłem ustaleń. Propozycje nie są zatwierdzonymi wymaganiami.

## Cel i etapy

Stworzyć przy użyciu AI grywalną grę przeglądarkową dla dwóch graczy, stanowiącą podstawę dalszego rozwoju. Kod i dokumentacja mają być na GitHubie.

Kolejność prac: wymagania → stack technologiczny i infrastruktura → implementacja → deployment. Nie wybieramy stacku przed zakończeniem wymagań.

## Potwierdzone założenia

- Gra typu tower defense dla dwóch graczy.
- Każdy gracz buduje i ulepsza wieże oraz produkuje i ulepsza moby.
- Wieże i moby działają autonomicznie. Moby próbują dotrzeć do bazy przeciwnika.
- Gracz przegrywa po przepuszczeniu 20 mobów do swojej bazy. Osiągnięcie progu przez obu graczy w tym samym kroku symulacji oznacza remis.
- Strategię gracza realizuje kod wywołujący udostępniony interfejs, np. budowanie, produkcja i ulepszanie.
- Prosta grafika; aplikacja dostępna w przeglądarce. PixiJS jest używane od MVP.0 do renderowania plansz i jednostek.
- MVP musi umożliwiać rozegranie pełnego meczu.
- MVP uruchamia pojedynek dwóch skryptów w jednej przeglądarce.
- MVP.0 zawiera przycisk start i podgląd meczu; strategie są w plikach repozytorium. Dwa edytory strategii zostają przeniesione do MVP.1.
- Rozgrywka dwóch osób online jest poza zakresem MVP.
- Zabezpieczenia i optymalizacja kodu dostarczonego przez gracza są poza zakresem MVP. Walidacja kodu jest planowana na późniejszy etap.
- Ustalenia przechowujemy w pliku, docelowo w repozytorium GitHub.

## Przebieg meczu i plansza — zatwierdzone

- Kod strategii jest przygotowywany przed startem i nie jest edytowany podczas meczu. W MVP.0 zmieniamy go w plikach repozytorium.
- Mecz przebiega w czasie rzeczywistym; strategie wywoływane są w regularnych krokach symulacji.
- Plansza jest prostokątna. Moby mogą poruszać się po niej dowolnie, bez z góry ustalonej ścieżki.
- Wieże można budować na planszy; budowa nie może całkowicie zablokować przejścia mobów do celu.
- Mecz nie ma limitu czasu. Użytkownik może przerwać go w dowolnym momencie.
- Plansza zawiera dwa osobne prostokątne pola obrony. Każdy gracz buduje na swoim polu labirynt dla mobów przeciwnika.
- Budowa odbywa się na siatce; wieża zajmuje jedno pole.
- Moby wybierają najkrótszą dostępną drogę do bazy i mogą przechodzić przez siebie, bez tworzenia zatorów.
- Budowa jest odrzucana, jeśli odcina przejście do bazy od wejścia lub od któregokolwiek żywego moba na polu obrony.
- Przerwanie kończy mecz wynikiem „mecz przerwany”, bez zwycięzcy. Następnie można zmienić kod i uruchomić nowy mecz; w MVP.0 kod zmieniamy w plikach repozytorium.
- Każde pole obrony ma początkowo 16 × 12 pól; wejście jest po lewej, baza po prawej. Wymiary i pozycje są parametrami konfiguracji.
- Moby poruszają się w czterech kierunkach, bez skosów. Wybór między równymi trasami jest deterministyczny.
- Nie można budować na wejściu, bazie, istniejącej wieży ani polu zajętym przez moba.
- Zmiana układu wież powoduje ponowne wyznaczenie najkrótszej drogi mobów.
- Początkowe pozycje na obu polach: wejście `(0, 6)`, baza `(15, 6)`.
- Równe trasy rozstrzygane są według stałej kolejności kierunków.

## Ekonomia — zatwierdzone

- Jeden zasób: złoto, wspólne dla budowy, produkcji i ulepszeń.
- Każdy gracz zaczyna z 200 złota.
- Stały przychód wynosi 10 złota na sekundę czasu symulacji.
- Zabicie moba daje obrońcy nagrodę zależną od typu moba. Dotarcie moba do bazy nie daje nagrody.
- Zakupiony mob pojawia się natychmiast na wejściu pola przeciwnika; brak kolejki produkcji. Każda sztuka kosztuje złoto.
- Budowa i ulepszenia działają natychmiast.
- Nieudana akcja nie pobiera zasobów i zwraca strategii przyczynę błędu, np. brak złota lub niedozwolone miejsce.
- Sprzedaż wieży zwraca 50% złota wydanego na wieżę i jej ulepszenia, umożliwiając przebudowę labiryntu.
- Wartości liczbowe są początkowymi parametrami do balansowania po testach.

## Jednostki i walka

### Zatwierdzony zakres

- MVP zawiera dwa typy wież i dwa typy mobów. Można później dodawać nowe typy bez przebudowy podstawowych zasad gry.
- Każda wieża ma trzy poziomy; ulepszenie dotyczy pojedynczej postawionej wieży.
- Każdy typ moba ma trzy poziomy ulepszeń, globalnych dla danego gracza. Ulepszenie dotyczy tylko kolejnych produkowanych mobów; już obecne zachowują swoje statystyki.
- Wieże wybierają spośród mobów w zasięgu cel o najkrótszej pozostałej drodze do bazy.
- Moby nie atakują wież ani innych mobów; ich celem jest dotarcie do bazy.
- MVP nie zawiera odporności, obrażeń krytycznych ani zdolności specjalnych mobów.

### Zatwierdzone typy

- Wieża podstawowa: obrażenia dla pojedynczego celu.
- Wieża obszarowa: obrażenia dla mobów wokół celu.
- Mob podstawowy: tani, przeciętne zdrowie i szybkość.
- Mob ciężki: wyższa cena i zdrowie, mniejsza szybkość.
- Wieża spowalniająca i mob szybki pozostają kandydatami na późniejsze rozszerzenie.

## Początkowe parametry jednostek — zatwierdzone

Parametry są punktem wyjścia do testów i znajdują się w centralnej konfiguracji.

| Wieża | Koszt złota | Obrażenia | Odstęp ataków | Zasięg |
|---|---:|---:|---:|---:|
| Podstawowa | 50 | 10 | 0,5 s | 3 pola |
| Obszarowa | 100 | 8 na moba | 1 s | 3 pola |

- Wieża obszarowa trafia wszystkie moby w promieniu 1,5 pola od celu.
- Trafienia są natychmiastowe; ewentualna animacja pocisku jest wyłącznie wizualna.

| Mob | Koszt złota | Zdrowie | Szybkość | Nagroda za zabicie |
|---|---:|---:|---:|---:|
| Podstawowy | 20 | 40 | 2 pola/s | 5 złota |
| Ciężki | 50 | 150 | 1 pole/s | 12 złota |

- Wieże: poziom 2 daje ×1,5 obrażeń, poziom 3 daje ×2 względem poziomu 1. Pozostałe statystyki pozostają bez zmian.
- Ulepszenie wieży z poziomu 1 na 2 kosztuje 100% bazowej ceny wieży, a z 2 na 3 kosztuje 150% bazowej ceny.
- Moby: poziom 2 daje ×1,5 zdrowia, poziom 3 daje ×2 względem poziomu 1.
- Globalne ulepszenie danego typu mobów z poziomu 1 na 2 kosztuje 200 złota, a z 2 na 3 kosztuje 400 złota.
- Koszt produkcji, szybkość i nagroda za zabicie moba pozostają stałe na wszystkich poziomach.
- Każdy mob docierający do bazy liczy się jako jedno przepuszczenie, niezależnie od typu i poziomu.

## Interfejs strategii — zatwierdzone

- Język kodu gracza: JavaScript. Jest to wymaganie interfejsu gracza; stack aplikacji pozostaje do wyboru.
- Funkcja `onTick(state, api)` jest wywoływana w każdym kroku strategii.
- Strategia otrzymuje pełny wgląd w oba pola: wieże, moby, złoto, ulepszenia i liczbę przepuszczonych mobów.
- Dostępne akcje: `buildTower`, `upgradeTower`, `sellTower`, `spawnMob`, `upgradeMob`.
- Strategia może przechowywać pamięć między wywołaniami, np. plan budowy. Pamięć jest resetowana przy nowym meczu.
- Błąd wykonania strategii przerywa mecz i pokazuje komunikat. Nieudana akcja, np. brak złota, zwraca przyczynę i nie przerywa działania strategii.
- Zatwierdzone sygnatury akcji:
  - `api.buildTower(type, x, y)`
  - `api.upgradeTower(towerId)`
  - `api.sellTower(towerId)`
  - `api.spawnMob(type)`
  - `api.upgradeMob(type)`
- Identyfikatory typów: wieże `basic`, `splash`; moby `basic`, `heavy`.
- Współrzędne zaczynają się od `(0, 0)` w lewym górnym rogu własnego pola obrony.
- `state` zawiera czas symulacji (pochodny numeru kroku, niezależny od czasu rzeczywistego i renderowania), numer kroku, konfigurację oraz dane obu graczy. `state.self` i `state.opponent` wskazują odpowiednią stronę.
- `state.self.outgoingMobs` udostępnia własne żywe moby na polu przeciwnika, ich liczbę, pozycje i statystyki na potrzeby taktyki ofensywnej.
- `api.memory` to zwykły mutowalny obiekt JavaScript, początkowo `{}`, przeznaczony na dowolne własne dane strategii. Każdy gracz ma osobny obiekt, zachowywany między wywołaniami i podczas pauzy. Nowy mecz resetuje go do `{}`; pamięć nie jest zapisywana po odświeżeniu strony w MVP.0.
- Wynik akcji ma postać `{ ok: true, ... }` lub `{ ok: false, error: "INSUFFICIENT_GOLD" }` (przykładowy kod błędu).
- `api.log(message)` zapisuje komunikat w logu gracza.
- Nowy mecz resetuje całą rozgrywkę, zachowując kod strategii i konfigurację.
- Szczegółowe pola obiektów jednostek i katalog kodów błędów zostaną opisane w dokumentacji API przed implementacją.

## Wykonywanie strategii i symulacja — zatwierdzone

- `onTick` jest wywoływane 10 razy na sekundę czasu symulacji; pierwsze wywołanie następuje przed rozpoczęciem ruchu mobów.
- Obie strategie otrzymują stan z początku tego samego kroku. Obserwacje są tylko do odczytu, a zmiany gry odbywają się przez API.
- Akcje jednej strategii wykonują się w kolejności wywołań. W kroku można wykonać wiele akcji, jeśli pozwalają na to złoto i zasady gry.
- Najpierw rozstrzygane są akcje obu graczy, następnie walka i ruch. Nowo wyprodukowany mob może zostać zaatakowany w tym samym kroku.
- API zwraca wynik akcji: sukces z identyfikatorem jednostki, której dotyczy akcja (jeśli ma zastosowanie), albo błąd z przyczyną.
- Dla tych samych kodów i konfiguracji wynik jest powtarzalny. API gry nie udostępnia losowości ani zegara rzeczywistego.
- Powtarzalność dotyczy strategii opartych na stanie i API gry. Kod używający bezpośrednio mechanizmów JavaScript takich jak `Math.random` lub `Date` nie ma gwarancji powtarzalności; ograniczanie takich mechanizmów jest częścią przyszłej walidacji kodu.
- Błąd wykonania kodu dowolnego gracza kończy mecz jako „błąd strategii”, bez zwycięzcy, ze wskazaniem gracza i komunikatem.
- Zasięg wież i promień obrażeń obszarowych są liczone w linii prostej. Wieże mogą strzelać przez inne wieże.
- Przy równej pozostałej drodze wieża wybiera moba o niższym ID.
- Ataki wszystkich wież są rozstrzygane jednocześnie. Nagroda za każdego zabitego moba jest przyznawana tylko raz.
- Nowa wieża może strzelić w kroku budowy. Ulepszenie nie resetuje czasu oczekiwania na kolejny atak.
- Pierwsze wywołanie strategii odbywa się przy czasie 0 i 200 złota. Kolejne kroki doliczają przychód przed wywołaniem strategii.

## Konfiguracja i balansowanie — zatwierdzone

- Wszystkie parametry rozgrywki są przechowywane w jednym centralnym miejscu konfiguracji.
- Dotyczy to ekonomii, kosztów, nagród, zwrotu przy sprzedaży, statystyk wież i mobów, ulepszeń, progu przegranej, wymiarów mapy i parametrów czasowych symulacji.
- Balansowanie polega na zmianie konfiguracji, bez edycji logiki gry. Logika i interfejs korzystają z tych samych wartości.
- Konkretna forma konfiguracji zostanie wybrana podczas ustalania stacku. Edytor balansowania w aplikacji nie jest na tym etapie wymagany.

## Testowanie strategii i obsługa meczu — zatwierdzone

- MVP zawiera dwie przykładowe strategie, dokumentację API i osobne logi obu graczy.
- W MVP.0 dwie strategie są przechowywane jako pliki w repozytorium i ładowane przez aplikację. Bez edytora, zapisu kodu w przeglądarce oraz importu/eksportu przez interfejs. Wdrożona wersja korzysta ze strategii dołączonych do danego wdrożenia.
- MVP nie zawiera kont, historii meczów ani powtórek.
- Dostępne są start, przerwanie i pauza meczu.
- Dostępne prędkości: 0,5×, 1×, 2×, 4×. Zmiana prędkości nie zmienia wyniku symulacji dla tych samych strategii i konfiguracji.
- Pauza zatrzymuje czas symulacji, przychód i wywołania strategii. Nie umożliwia edycji kodu trwającego meczu.

## Zakres aplikacji i odbiór MVP.0 — zatwierdzone

- Docelowe urządzenie: komputer; aktualne Chrome i Firefox. Obsługa telefonu poza MVP.
- Prosta grafika 2D w PixiJS: kształty, siatka, kolory graczy, rozróżnialne jednostki, paski zdrowia i poziomy wież. Silnik jest niezależny od grafiki; katalog wyglądu umożliwia późniejsze użycie sprite’ów.
- Podczas meczu widoczne są oba pola, złoto, ulepszenia mobów, liczba przepuszczeń, czas symulacji i osobne logi graczy.
- Po zakończeniu wyświetlane są wynik i przyczyna zakończenia.
- Pierwszy deployment jest przeznaczony dla zaufanych testerów. Uruchamiane strategie pochodzą z plików repozytorium; brak pobierania kodu innych graczy przez aplikację.
- Brak rankingu, matchmakingu, kampanii i płatności.

Kryteria odbioru MVP.0:

- Przykładowe strategie rozgrywają pełny mecz zakończony wynikiem.
- Wszystkie akcje, ulepszenia i zasady legalności budowy działają.
- Pauza i zmiana prędkości nie zmieniają wyniku deterministycznego meczu.
- Przerwanie i błędy strategii dają czytelny rezultat.
- Zmiana plików strategii umożliwia rozegranie meczu z nowym kodem po jego ponownym załadowaniu do aplikacji.
- Aplikacja działa pod docelowym adresem; repozytorium zawiera instrukcję uruchomienia, zmiany strategii i dokumentację API.

## MVP.1

- Dwa edytory strategii w aplikacji (przeniesione z pierwotnego zakresu).
- Lokalny zapis kodu w przeglądarce, przywracanie przykładów oraz import/eksport kodu pozostają propozycjami do potwierdzenia przy definiowaniu MVP.1.

## Późniejsze rozszerzenia

- Rozegranie meczu bez oczekiwania na animację, tak szybko jak pozwala symulacja.
- Przy braku limitu czasu mecz może nie zakończyć się samodzielnie; przyszły tryb szybkiego rozegrania również musi umożliwiać przerwanie.
- Multiplayer online oraz kolejne typy jednostek.

## Dokumenty uzupełniające i następny etap

- [API strategii](API-STRATEGII.md): szczegółowy kontrakt i konwencje implementacyjne.
- [Scenariusze odbioru](ODBIOR-MVP.md): weryfikacja grywalności i zasad.
- Wymagania funkcjonalne MVP.0 są domknięte. Stack i infrastruktura są zatwierdzone w STACK-I-INFRA.md. Następny etap: implementacja.
- Początkowy balans wymaga sprawdzenia w grywalnej implementacji.

## Rejestr decyzji

- 2026-10-12: zapisano początkowe założenia użytkownika; stack i infrastruktura pozostają nieustalone.
- 2026-10-12: zatwierdzono lokalny pojedynek dwóch skryptów w jednej przeglądarce, dwa edytory, przycisk start i obserwację meczu; multiplayer online poza MVP.

- 2026-10-12: zatwierdzono kod przed startem, czas rzeczywisty, regularne kroki strategii, prostokątną planszę bez stałych ścieżek i zakaz blokowania przejścia; próg przegranej 20 mobów, remis w tym samym kroku; brak limitu czasu i możliwość przerwania. Zapisano pomysły sterowania prędkością i szybkiego rozegrania.

- 2026-10-12: zatwierdzono dwa osobne pola obrony, siatkę i wieże zajmujące jedno pole, najkrótszą dostępną drogę, przenikanie mobów, odrzucanie budowy odcinającej wejście lub żywego moba od bazy oraz przerwanie bez zwycięzcy z możliwością edycji i restartu.

- 2026-10-12: zatwierdzono ekonomię (200 złota na start, 10/s, nagrody za zabicia, natychmiastowe akcje i sprzedaż za 50%) oraz centralną konfigurację wszystkich parametrów rozgrywki do łatwego balansowania.

- 2026-10-12: ograniczono MVP do dwóch typów wież i mobów z możliwością rozszerzenia; zatwierdzono trzy poziomy ulepszeń, ulepszanie wież indywidualnie i mobów globalnie tylko dla nowych jednostek, wybór celu według pozostałej drogi, brak walki mobów i dodatkowych mechanik. Konkretny wybór typów pozostaje do potwierdzenia.

- 2026-10-12: zatwierdzono wieże podstawową i obszarową, moby podstawowego i ciężkiego oraz JavaScript, `onTick(state, api)`, pełny wgląd w oba pola, pięć akcji API, pamięć strategii i zasady obsługi błędów.

- 2026-10-12: zatwierdzono mapy 16 × 12, wejście po lewej i bazę po prawej, ruch bez skosów i deterministyczne trasy, ograniczenia budowy i ponowne wyznaczanie drogi; dwie strategie, dokumentację i logi, lokalny zapis kodu, brak kont/historii/powtórek; start, przerwanie, pauzę i prędkości 0,5×–4×. Tryb bez animacji odłożono poza MVP.

- 2026-10-12: zatwierdzono 10 wywołań strategii/s, wspólny stan początku kroku, obserwacje tylko do odczytu, kolejność akcji, wielokrotne akcje, walkę przed ruchem, wyniki API, powtarzalność i przerwanie bez zwycięzcy przy błędzie strategii.

- 2026-10-12: zatwierdzono początkowe statystyki dwóch typów wież i mobów, promień obrażeń obszarowych, natychmiastowe trafienia, mnożniki i koszty ulepszeń oraz jedno przepuszczenie na każdego moba.

- 2026-10-12: zatwierdzono komputer/Chrome/Firefox, prostą grafikę 2D, statystyki i wynik, zaufanych testerów oraz wyłączenie rankingu/matchmakingu/kampanii/płatności. Wprowadzono podział: MVP.0 ma strategie w plikach repozytorium; edytor przesunięto do MVP.1. Kryteria odbioru dostosowano do MVP.0; zastępuje to wcześniejsze ustalenia o edytorach i lokalnym zapisie kodu w pierwszej wersji.

- 2026-10-12: zatwierdzono sygnatury API, identyfikatory typów, współrzędne, ogólną strukturę stanu, wyniki akcji, logowanie i reset meczu; doprecyzowano `api.memory` jako osobny mutowalny obiekt każdego gracza, zachowywany między krokami i resetowany przy nowym meczu.

- 2026-10-12: zatwierdzono pozycje wejścia/bazy, odległość w linii prostej i strzelanie przez wieże, deterministyczne remisy tras/celów, jednoczesne ataki i pojedynczą nagrodę, atak w kroku budowy, zachowanie cooldownu przy ulepszeniu oraz przychód przed strategią od kolejnego kroku. Domknięto wymagania funkcjonalne MVP.0.

- 2026-10-12: po przeglądzie doprecyzowano czas jako pochodny kroku symulacji, niezależny od renderowania, i dodano jawny widok własnych mobów ofensywnych `outgoingMobs`.

- 2026-10-12: zatwierdzono PixiJS od MVP.0, kształty na początek i architekturę umożliwiającą zastąpienie ich grafikami bez zmian w silniku. Zastępuje to propozycję bezpośredniego renderera Canvas 2D.

- 2026-10-12: zatwierdzono ręczne uruchamianie deploymentu; push nie aktualizuje wdrożonej strony.

- 2026-10-12: zatwierdzono cały stack: Angular, TypeScript, PixiJS, Vitest, GitHub Actions i GitHub Pages, bez backendu i bazy; deployment ręczny.

## Repozytorium

Repozytorium: https://github.com/maciejkoch/code-tower-defense
Właściciel: maciejkoch. Widoczność: publiczne.
Dokument w repozytorium: docs/WYMAGANIA-MVP.md.

## Zasady pracy

- Pracujemy na lokalnym klonie repozytorium.
- Ustalenia i zmiany zapisujemy lokalnie.
- Commit i push wykonujemy wyłącznie na wyraźne życzenie użytkownika.
