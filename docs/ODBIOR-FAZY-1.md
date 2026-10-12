# Odbiór fazy 1

Data: 2026-10-12. Status: implementacja gotowa, oczekuje na przegląd użytkownika.

## Dostarczony efekt

- Angular 22.2.2, standalone, Signals i zoneless, bez sufiksów `.component`/`.service`.
- Dwie plansze PixiJS 16 × 12, wejścia i bazy zgodne z konfiguracją.
- Stan początkowy obu graczy: 200 złota, 0/20 przepuszczeń, poziomy mobów 1, czas 0 s.
- Osobne warstwy konfiguracji, modelu gry, renderera i interfejsu.
- Renderer ładowany osobno, z obsługą błędu WebGL i zwalnianiem zasobów.
- Instrukcja uruchomienia i kolejność przeglądu kodu w README.md.

## Weryfikacja

- `npm run typecheck`: poprawne typy aplikacji i testów.
- `npm test`: 6 testów, wszystkie zaliczone.
- `npm run build`: poprawny build produkcyjny.
- Przegląd w przeglądarce Codex: dwa canvasy, widoczne siatki i oznaczenia, brak błędów i ostrzeżeń konsoli. Sprawdzono układ szeroki (1440 px) i wąski (około 690 px); szeroki bez poziomego przepełnienia.
- axe-core: brak naruszeń automatycznych reguł WCAG A/AA w jsdom, z wyłączonym testem kontrastu wymagającym renderowania. Kontrast głównych par kolorów tekst/tło obliczony osobno: 6,93:1 lub wyższy. Nie jest to pełny audyt dostępności.
- Chrome i Firefox: pełny odbiór między przeglądarkami pozostaje w fazie 6.

Scenariusz ręcznego odbioru: README.md → „Odbiór fazy 1”.

Faza 1 pokazuje nieruchomy stan początkowy; nie zawiera ruchu, walki, wykonywania strategii ani sterowania meczem. Faza 2 nie została rozpoczęta. Nie wykonano commit, push ani deploymentu.
