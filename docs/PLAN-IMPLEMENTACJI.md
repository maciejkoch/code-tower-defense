# Plan implementacji MVP.0

Data: 2026-10-12. Status: plan i architektura zaakceptowane; faza 1 zaimplementowana, oczekuje na przegląd użytkownika.

Punktem wyjścia są WYMAGANIA-MVP.md, API-STRATEGII.md, STACK-I-INFRA.md i ODBIOR-MVP.md. Repozytorium zawiera dokumentację; implementacja nie została rozpoczęta. Plan nie zmienia zatwierdzonego zakresu gry.

## Sposób pracy

- Implementujemy jedną fazę naraz. Po jej zakończeniu zatrzymujemy pracę do przeglądu i akceptacji użytkownika.
- Każda faza pozostawia uruchamialną aplikację z widocznym efektem. Wczesne fazy korzystają z jawnie opisanych scenariuszy demonstracyjnych, zanim powstanie pełny pojedynek strategii.
- Przy odbiorze przekazujemy: zakres zmian, komendę uruchomienia, krótki scenariusz ręcznego sprawdzenia, wyniki testów i listę najważniejszych plików w kolejności do przeglądu.
- Reguły silnika sprawdzamy automatycznie; działanie i czytelność grafiki także w przeglądarce. Każda faza musi przechodzić dostępne sprawdzenie typów, testy i build.
- Zapisujemy zmiany lokalnie. Commit i push wyłącznie na wyraźne życzenie użytkownika. Deployment pozostaje ręczny.
- Nie włączamy do MVP.0 edytorów strategii, multiplayera, backendu ani izolacji niezaufanego kodu.

## Faza 1 — uruchomienie aplikacji i dwie plansze

Zakres: inicjalizacja zatwierdzonego stacku, sprawdzenie i przypięcie zgodnych wersji Angulara 22, PixiJS, Node i narzędzi. Oficjalne skille Angulara, standalone components, Signals i zoneless; Signal Forms dla przyszłych formularzy. Nazwy bez sufiksów `.component` i `.service`. Podział katalogów zgodny ze STACK-I-INFRA.md. Centralna konfiguracja, początkowy stan meczu, widok Angular i renderer PixiJS. README z instalacją i uruchamianiem oraz podstawowe skrypty weryfikacji.

Widoczny efekt: dwie plansze 16 × 12 z wejściami, bazami i oznaczeniami graczy; początkowe złoto i przepuszczenia. Bez pozorowania działającego meczu.

Odbiór: aplikację można uruchomić według README; oba pola są czytelne, zgodne z konfiguracją, a build działa. Do przeglądu: konfiguracja, model stanu, komponent planszy i renderer. Logika gry nie zależy od Angulara ani PixiJS.

## Faza 2 — ruch i czas symulacji

Zakres: stały krok 0,1 s, deterministyczne wyszukiwanie najkrótszej drogi, ruch po czterech kierunkach, demonstracyjna produkcja mobów na obu polach, przepuszczenia oraz zakończenie przy progu przegranej. Start, pauza, wznowienie, przerwanie, nowy mecz i prędkości 0,5×–4×.

Widoczny efekt: moby maszerują do baz; rosną liczniki, można zatrzymać i przyspieszyć przebieg, zobaczyć wynik oraz uruchomić go od nowa.

Odbiór: pauza zatrzymuje czas i ruch; prędkość nie zmienia końcowego stanu scenariusza; osiągnięcie progu przez obu graczy w tym samym kroku daje remis. Testy ruchu, tras, zakończeń i resetu. Do przeglądu: krok silnika, routing i sterownik odtwarzania.

## Faza 3 — ekonomia i budowanie labiryntu

Zakres: przychód, koszty, produkcja dwóch typów mobów, budowa i sprzedaż wież oraz wyniki akcji. Walidacja pól i drożności od wejścia oraz od każdego żywego moba. Ponowne wyznaczanie tras, także podczas ruchu między środkami pól. Deterministyczny scenariusz demonstruje akcje i odrzucenia; nie dodajemy ręcznego sterowania jako nowego wymagania produktu.

Widoczny efekt: pojawiające się wieże zmieniają trasę mobów, sprzedaż otwiera drogę, saldo zmienia się po zakupach i wraz z upływem czasu. Widać przyczyny odrzuconych prób budowy.

Odbiór: nie można zablokować wejścia ani odciąć żywego moba; oba końce krawędzi zajętej przez moba są chronione. Nieudana akcja nie zmienia stanu ani salda. Sprzedaż zwraca właściwą kwotę. Testy legalności budowy, ekonomii, produkcji i przeliczania tras. Do przeglądu: akcje, walidacja i ekonomia.

## Faza 4 — walka i ulepszenia

Zakres: wieże basic i splash, wybór celu, jednoczesne trafienia przed ruchem, cooldowny, śmierć mobów i nagrody. Trzy poziomy wież i produkcji mobów, właściwe koszty i zwrot po sprzedaży ulepszonej wieży. Zdrowie, poziomy i rozróżnialny wygląd jednostek.

Widoczny efekt: wieże strzelają, moby tracą zdrowie i giną; scenariusz pokazuje atak obszarowy oraz ulepszenia.

Odbiór: wszystkie reguły walki i ulepszeń mają testy, w tym pojedyncza nagroda przy równoczesnych trafieniach, remis celu według ID, atak nowej wieży oraz zachowanie cooldownu po ulepszeniu. Ulepszenie produkcji nie zmienia istniejących mobów. Do przeglądu: walka, statystyki jednostek i prezentacja zdarzeń.

## Faza 5 — pełny pojedynek dwóch strategii JavaScript

Zakres: dwa pliki strategii, onTick(state, api), pełne API akcji, osobna pamięć i logi graczy, migawki początku tego samego kroku oraz obsługa błędów wykonania. Zastąpienie demonstracji rzeczywistym pojedynkiem. Doprecyzowanie formatu eksportu i aktualizacja dokumentacji API, w tym nieaktualnej wzmianki o niewybranym stacku.

Widoczny efekt: Start uruchamia pełny mecz dwóch skryptów; widać ich decyzje i wynik. Zmiana pliku strategii oraz ponowne załadowanie aplikacji zmienia zachowanie gracza.

Odbiór: przykładowy mecz kończy się wynikiem. Obserwacje nie pozwalają zmieniać silnika, pamięć jest oddzielna, pauza ją zachowuje, a nowy mecz resetuje stan i logi. Wyjątek wskazuje gracza i kończy mecz bez zwycięzcy. Testy integracyjne potwierdzają powtarzalność meczu dla wszystkich prędkości. Do przeglądu: adapter strategii, migawki, przykłady i integracja z UI.

## Faza 6 — odbiór całego MVP.0 i przygotowanie publikacji

Zakres: przejście wszystkich lokalnych scenariuszy ODBIOR-MVP.md, poprawki wykrytych błędów i czytelności, sprawdzenie w Chrome i Firefox, ocena grywalności przykładowych strategii. Uzupełnienie instrukcji, CI dla typów/testów/buildu i workflow publikacji uruchamianego wyłącznie ręcznie.

Widoczny efekt: kompletna lokalna wersja MVP.0 gotowa do udostępnienia testerom, z czytelnymi statystykami, logami i rezultatami zakończeń.

Odbiór: udokumentowany wynik każdego lokalnego scenariusza; instrukcja uruchomienia i zmiany strategii sprawdzona. Zmiany balansu, jeśli potrzebne, są opisane i wprowadzane w centralnej konfiguracji. Do przeglądu: poprawki, dokumentacja i workflow. Scenariusz wdrożonego adresu pozostaje do fazy 7.

## Faza 7 — ręczny deployment i sprawdzenie strony

Zakres: po zleceniu publikacji oraz wymaganym przez użytkownika commit/push — konfiguracja GitHub Pages, ręczne uruchomienie workflow i weryfikacja pod docelowym adresem. Sprawdzenie ścieżek zasobów, ładowania strategii oraz pełnego meczu.

Widoczny efekt: gra dostępna z publicznego adresu GitHub Pages.

Odbiór: wdrożona aplikacja przechodzi scenariusz 23 z ODBIOR-MVP.md, a push sam nie uruchamia publikacji. Użytkownik otrzymuje adres strony i instrukcję kolejnego ręcznego wdrożenia.

## Najbliższy krok

Odbiór fazy 1 według README.md. Faza 2 pozostaje nierozpoczęta. Każda kolejna faza wymaga zakończenia odbioru poprzedniej.
