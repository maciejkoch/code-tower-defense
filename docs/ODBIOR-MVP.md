# Scenariusze odbioru MVP.0

## Rozgrywka

1. Dwie dołączone strategie kończą mecz zwycięstwem lub remisem. Widoczny wynik odpowiada liczbie przepuszczonych mobów.
2. Każdy typ i poziom moba liczy się jako jedno przepuszczenie. Jednoczesne osiągnięcie progu w jednym kroku daje remis.
3. Mecz może trwać bez limitu; ręczne przerwanie kończy go bez zwycięzcy.
4. Nowy mecz resetuje jednostki, złoto, poziomy produkcji, przepuszczenia, zegar, logi i pamięć strategii.

## Ekonomia i akcje

5. Przy czasie 0 gracze mają po 200 złota; po sekundzie przybywa po 10 złota przy braku innych transakcji.
6. Budowa, produkcja i oba rodzaje ulepszeń pobierają właściwy koszt. Wiele akcji w kroku respektuje aktualne saldo.
7. Nieudana akcja zwraca właściwy błąd i nie zmienia stanu ani złota; strategia może kontynuować.
8. Sprzedaż zwraca 50% faktycznego kosztu wieży i jej ulepszeń.
9. Ulepszenie mobów zmienia tylko kolejne produkowane sztuki. Ulepszenie wieży dotyczy wyłącznie wskazanej wieży; poziom nie przekracza 3.

## Mapa i walka

10. Nie można budować poza planszą, na wejściu/bazie, wieży ani mobie.
11. Budowa odcinająca wejście od bazy lub zamykająca żywego moba jest odrzucana, również gdy wejście nadal ma drogę.
12. Legalna zmiana labiryntu zmienia trasę mobów; moby nie poruszają się po skosie ani nie blokują się nawzajem.
13. Wieże wybierają najbliższy bazy cel w zasięgu, a remis rozstrzyga ID. Strzelanie przez wieże jest dozwolone.
14. Wieża obszarowa zadaje właściwe obrażenia wszystkim mobom w promieniu. Jednoczesne zabicie przez wiele wież przyznaje jedną nagrodę.
15. Nowa wieża może atakować w kroku budowy; ulepszenie nie resetuje cooldownu.

## API i sterowanie

16. Obaj gracze widzą stan początku tego samego kroku. Modyfikowanie obserwacji nie zmienia rozgrywki.
17. Pamięć jest osobna dla graczy, zachowana między krokami i podczas pauzy, resetowana w nowym meczu.
18. Błąd wykonania strategii kończy mecz bez zwycięzcy i identyfikuje gracza oraz przyczynę.
19. Pauza zatrzymuje symulację, przychód i wywołania. Przerwanie działa także podczas pauzy.
20. Te same deterministyczne strategie i konfiguracja dają ten sam wynik oraz stan końcowy przy 0,5×, 1×, 2× i 4×.

## Aplikacja i deployment

21. Oba pola, jednostki, zdrowie, poziomy wież, złoto, ulepszenia mobów, przepuszczenia, czas i logi są czytelne w Chrome i Firefox na komputerze.
22. Zmiana strategii w pliku i ponowne załadowanie aplikacji uruchamia nowy kod; pierwsza wersja nie wymaga edytora w przeglądarce.
23. Wdrożona aplikacja działa pod docelowym adresem z dołączonymi strategiami. Repo zawiera instrukcję uruchomienia, zmiany strategii i API.

Scenariusze reguł silnika wymagają automatycznej weryfikacji; czytelność interfejsu i deployment wymagają także przeglądu w przeglądarce. Balans i grywalność przykładów sprawdzamy podczas pierwszych pełnych meczów.
