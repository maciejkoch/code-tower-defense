# Odbiór fazy 5

Data: 2026-10-13. Status: implementacja gotowa, oczekuje na ręczny odbiór i akceptację użytkownika. Dane poniżej dotyczą pierwotnej fazy 5; aktualne strategie, parametry i wyniki po korektach opisuje [Balans B2](BALANS-B2.md).

## Dostarczone

- Dwa rzeczywiste moduły JavaScript: `src/strategies/player-one.js` i `player-two.js`, eksportujące `name` i synchroniczne `onTick(state, api)`.
- Strategie „Obrona i kontratak” oraz „Ciężki szturm” korzystają z silnika przez API; stary harmonogram demonstracyjny został usunięty.
- Wspólny stan początku kroku, sklonowany i rekurencyjnie zamrożony przed pierwszą strategią. Oba widoki zawierają pełne dane jednostek i `outgoingMobs`, bez wewnętrznych pól ruchu.
- Pięć synchronicznych akcji, wynik sukcesu/błędu, aktualne rozliczanie salda i ograniczenie operacji do własnego gracza.
- Osobne mutowalne obiekty pamięci, zachowywane między krokami i przy pauzie, resetowane w nowym meczu.
- Logowanie z czasem i numerem kroku, nazwy strategii w UI oraz błąd z graczem i komunikatem, bez zwycięzcy.
- API zamykane po wywołaniu; Promise w `onTick` daje czytelny błąd. Izolacja niezaufanego JavaScript pozostaje poza MVP.0.
- Dokumentacja API, format modułów i instrukcja zmiany skryptów oraz przeładowania aplikacji.

## Weryfikacja

- `npm run check`: zaliczone — typy, 68 testów w 9 plikach i produkcyjny build.
- Domyślne strategie kończą pojedynek w ticku 475 (47,5 s): wygrywa gracz 1, przepuszczenia 2 i 20.
- Identyczny pełny stan końcowy przy 0,5×, 1×, 2× i 4×, nieregularnych klatkach, pauzach i zmianach prędkości.
- Testy sprawdzają wspólną obserwację mimo natychmiastowych akcji, zamrożenie konfiguracji i jednostek, brak mutacji silnika, wszystkie akcje, błędy akcji bez przerwania, pamięć i reset oraz wyjątki i asynchroniczne wywołania.
- Sprawdzono obserwacje na granicy kroku: aktualne pozycje, przychód i cooldown, bez przesunięcia zegara strategii.
- Test UI sprawdza wskazanie gracza przy błędzie, bezpieczne tekstowe wyświetlenie komunikatu, zatrzymanie klatek oraz reset wyniku i logów.
- axe-core w jsdom: brak automatycznych naruszeń WCAG A/AA w początkowym i końcowym interfejsie HTML; kontrast wymaga prawdziwego renderowania.
- Ręczny podgląd GPU i zmiana pliku JS z przeładowaniem pozostają elementami odbioru użytkownika. Wcześniejszy dostęp narzędziowy do strony lokalnej został zablokowany przez politykę przeglądarki; blokady nie obchodzono.

## Odbiór

README.md zawiera scenariusz meczu, sposób zmiany pliku strategii, test błędu oraz kolejność czytania kodu. API-STRATEGII.md opisuje kompletny kontrakt i minimalny przykład własnego skryptu.

Faza 4 została wypchnięta w commicie `453dbae`. Zmiany fazy 5 pozostają lokalne do przeglądu. Faza 6 (pełny odbiór MVP i przygotowanie CI/deploymentu) nie została rozpoczęta.
