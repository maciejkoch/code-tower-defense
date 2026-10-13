# Odbiór fazy 6

Data: 2026-10-13. Implementacja i automatyczne sprawdzenia gotowe; ręczny odbiór Chrome/Firefox pozostaje do wykonania. Faza 5 wraz z balansem B2 została zaakceptowana i wypchnięta jako `c6770b3`. Faza 6 pozostaje lokalna do przeglądu. Publikacji nie uruchamiano.

## Dostarczone

- CI na push do `main`, pull request i ręczne uruchomienie: przypięte Node z `.nvmrc`, npm 12.0.2, `npm ci`, typy, testy, build, sprawdzenie plików i krótkie pojedynki strategii.
- Osobny workflow publikacji wyłącznie przez `workflow_dispatch` na `main`, z kontrolami przed wysłaniem artefaktu i deploymentem.
- Wariant buildu pod `/code-tower-defense/` i kontrola base href, zasobów oraz importów JavaScript. Kontrola wykryła problem produkcyjny w dodatkowej optymalizacji fragmentów Angulara; wyłączenie tego etapu przy zachowaniu minifikacji naprawiło brakujące importy PixiJS.
- Scenariusze odbioru zaktualizowane do balansu B2, bonusów przychodu i kolejki.
- Logi dostępne do przewijania klawiaturą, widoczny fokus, zawijanie długich logów i komunikatów błędu, legenda planszy może zajmować więcej niż jeden wiersz.
- Uzupełnione testy wszystkich typów i poziomów przepuszczonych mobów, braku limitu czasu i zatrzymania kolejki/ekonomii/strategii w kroku zakończenia.
- Instrukcja ręcznej publikacji i powrotu do wcześniejszej wersji w DEPLOYMENT.md.

## Wyniki automatyczne

- Typy, 89 testów w 12 plikach, build produkcyjny: zaliczone.
- Build Pages i kontrola zasobów/importów: zaliczone. Zweryfikowano sześć odwołań w HTML i 128 importów fragmentów JavaScript.
- Testy axe-core w jsdom dla początkowego i końcowego HTML: zaliczone. Kontrast oraz obraz canvas wymagają rzeczywistej przeglądarki.
- 25 pojedynków pięciu polityk: zakończenia w 32,2–107 s; automatyczna kontrola czasu, wyniku i przepuszczeń po zamianie stron zaliczona. Mecze lustrzane kończą się remisem.
- Domyślny mecz pozostaje deterministyczny: 32,2 s, wygrywa gracz 1, przepuszczenia 1/20. Testy porównują pełny stan przy 0,5×–4×, nieregularnych klatkach, pauzach i zmianach prędkości.
- Kontrole wykonywano lokalnie. Nowe workflow nie są jeszcze wypchnięte, więc nie zostały uruchomione na runnerze GitHub.

Polityka szybkiego naporu jest nadal silniejsza od pozostałych w tej serii, a domyślna ciężka strategia przegrywa z adaptacyjną. Nie zmieniano ponownie parametrów gry w fazie 6. Wyniki i ograniczenia balansu opisuje BALANS-B2.md; brak przewagi numeru gracza nie oznacza równej siły przykładowych strategii.

## Scenariusze ODBIOR-MVP.md

| Nr  | Wynik i dowód                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Test pełnego meczu i wynik UI; kończy się zwycięstwem.                                                              |
| 2   | Testy sześciu kombinacji typ/poziom oraz jednoczesnego remisu.                                                      |
| 3   | Mecz bezczynnych strategii trwa ponad 300 s i daje się przerwać.                                                    |
| 4   | Reset sesji, pamięci, logów, przychodu i kolejki w testach.                                                         |
| 5   | Początkowy stan, przychód, bonusy za produkcję i limit w testach.                                                   |
| 6   | Akcje i ulepszenia w kolejności wywołań; nowe koszty produkcji w testach.                                           |
| 7   | Nieudane akcje nie zmieniają stanu; strategia kontynuuje.                                                           |
| 8   | Zwrot od całego wydatku i złoto ułamkowe w testach.                                                                 |
| 9   | Statystyki przy zakupie, przyszłe moby, własność wieży i limit poziomu w testach.                                   |
| 10  | Wszystkie ograniczenia pól budowy w testach.                                                                        |
| 11  | Odcięcie wejścia oraz żywego moba przy drożnym wejściu w testach.                                                   |
| 12  | Routing, ruch po krawędziach i przeliczenie trasy przy wejściu z kolejki w testach.                                 |
| 13  | Pozostały dystans, ID, zasięg i strzelanie przez wieże w testach.                                                   |
| 14  | Promień, sześć ofiar, kolejność, sumowanie obrażeń i pojedyncza nagroda w testach.                                  |
| 15  | Nowa wieża i zachowanie cooldownu po ulepszeniu w testach.                                                          |
| 16  | Wspólne migawki, ich zamrożenie i brak mutacji silnika w testach.                                                   |
| 17  | Oddzielna pamięć, pauza i reset w testach.                                                                          |
| 18  | Błędy obu graczy, Promise, bezpieczne wyświetlenie tekstu i koniec odtwarzania w testach.                           |
| 19  | Pauza/wznowienie, kolejki, przychód i przerwanie z pauzy w testach.                                                 |
| 20  | Pełny stan identyczny przy wszystkich prędkościach w testach.                                                       |
| 21  | HTML i axe zweryfikowane automatycznie; obraz GPU, kontrast i czytelność Chrome/Firefox oczekują.                   |
| 22  | Strategie dołączone do buildu, typowane JSDoc i wykonywane w testach; ręczna zmiana pliku i przeładowanie oczekują. |
| 23  | Build i ścieżka Pages zweryfikowane; publiczny adres i scenariusz po wdrożeniu należą do fazy 7.                    |

## Ręczny odbiór do zakończenia fazy 6

W Chrome i Firefox otwórz lokalną aplikację, odśwież stronę i:

1. Uruchom mecz na 1×, sprawdź obie plansze, zdrowie, poziomy, trasy, przychód i licznik kolejki. Domyślny mecz kończy się po 32,2 s czasu symulacji.
2. W nowym meczu wybierz 0,5× i zatrzymaj falę w trakcie wypuszczania. Po wznowieniu wejścia powinny zachować odstęp; przy 4× wynik pozostaje taki sam.
3. Przejdź klawiaturą przez przyciski i oba logi. Strzałki/Page Down powinny przewijać skupiony log. Sprawdź czytelność przy powiększeniu 125% i w oknie o szerokości około 1050 px.
4. Zmień nazwę lub politykę w pliku strategii, przeładuj stronę i sprawdź nowy mecz; następnie cofnij zmianę. Można też użyć przykładu celowego błędu z README.

Wcześniejszy dostęp narzędziowy do lokalnej strony został zablokowany przez politykę przeglądarki; nie ponawiano go innym narzędziem ani adresem. Nie oznaczono ręcznych scenariuszy jako zaliczonych. Po ich odbiorze i zleceniu publikacji można przejść do fazy 7.

## Kolejność przeglądu

1. `.github/workflows/ci.yml` i `deploy.yml` — kontrole i wyłącznie ręczna publikacja.
2. `tools/build.mjs`, `verify-build.mjs`, `balance.mjs` — obejście optymalizatora, kompletność plików i weryfikacja meczów.
3. `src/game/engine/acceptance.spec.ts` — uzupełniające scenariusze silnika.
4. `src/app/player-log/player-log.ts`, `match-controls/match-controls.ts`, `app.css` — czytelność i dostępność.
5. `docs/DEPLOYMENT.md`, `ODBIOR-MVP.md` i README.md — instrukcje.
