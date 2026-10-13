# Odbiór fazy 3

Data: 2026-10-13. Status: zaakceptowana przez użytkownika; zlecono commit, push i rozpoczęcie fazy 4.

## Dostarczone

- Przychód 10 G/s czasu symulacji, koszty budowy i produkcji, sprzedaż za 50% faktycznych wydatków.
- Budowa basic/splash, sprzedaż własnej wieży oraz produkcja basic/heavy na polu przeciwnika, z wynikami sukcesu i kodami błędów.
- Nieudana akcja zachowuje stan, saldo i licznik ID. Kolejna legalna akcja może się wykonać.
- Ochrona wejścia, bazy, wież i obu końców zajętej przez moba krawędzi.
- Odrzucenie budowy odcinającej wejście lub żywego moba, również gdy wejście nadal ma drogę.
- Natychmiastowa zmiana pozostałego dystansu po budowie/sprzedaży bez przesunięcia moba. Ruch kontynuuje aktualną krawędź.
- Osobne logi graczy, rozróżnialne wieże i dwa typy mobów w PixiJS.
- Demonstracja finansowana z salda: ściana, odrzucenie jej zamknięcia w 88 s, sprzedaż w 92 s ze zwrotem 25 G; pełny mecz kończy się remisem po 160,5 s.

## Weryfikacja

- `npm run typecheck`: zaliczone.
- `npm test`: 38 testów w 5 plikach, wszystkie zaliczone.
- `npm run build`: zaliczony build produkcyjny.
- Testy obejmują reguły ekonomii, legalność budowy, scenariusz ściany i sprzedaży, przekazywanie jednostek do renderera, obsługę przycisków oraz identyczny pełny stan końcowy przy prędkościach 0,5×/1×/2×/4×, pauzach i nieregularnych klatkach.
- axe-core w jsdom: brak automatycznych naruszeń WCAG A/AA w początkowym i końcowym interfejsie. Reguła kontrastu wymaga rzeczywistego renderowania i pozostaje wyłączona w jsdom.
- Podgląd GPU w przeglądarce wymaga ręcznego odbioru. Poprzednia próba narzędziowa została zablokowana przez politykę przeglądarki; blokady nie obchodzono.

## Granica czasu kroku

Start przygotowuje akcje kroku 0 z początkowym złotem, bez ruchu i przychodu. Każde odtworzenie 0,1 s kończy ruch przygotowanego kroku, sprawdza wynik obu pól i — gdy mecz trwa — przygotowuje następny krok: przychód, następnie akcje. Dzięki temu następne akcje mają naliczony przychód przed ruchem swojego kroku; pauza zachowuje przygotowany stan. Silnik nadal nie używa zegara rzeczywistego.

## Odbiór użytkownika

Instrukcja uruchomienia, scenariusz i kolejność czytania plików: README.md. Szczególnie sprawdź widoczny objazd wież, oba logi i otwarcie przejścia po sprzedaży. Walka i ulepszenia pozostają w fazie 4; interfejs strategii w fazie 5.

Faza 2 została wypchnięta w commicie `53642f8`. Zmiany fazy 3 zatwierdzono do zapisu i publikacji. Kolejny etap: faza 4.
