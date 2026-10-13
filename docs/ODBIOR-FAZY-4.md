# Odbiór fazy 4

Data: 2026-10-13. Status: zaakceptowana przez użytkownika; zlecono commit, push i rozpoczęcie fazy 5.

## Dostarczone

- Basic zadaje obrażenia jednemu celowi, splash wszystkim mobom w promieniu od celu, również samemu celowi.
- Cel o najmniejszej pozostałej drodze, remis według niższego ID; zasięg i promień w linii prostej, bez blokowania strzałów przez wieże.
- Jednoczesny wybór celów i sumowanie trafień przed usunięciem zabitych mobów. Jedna nagroda za moba, wypłacana obrońcy.
- Ataki przed ruchem; nowa wieża może od razu atakować, a nowy mob zostać trafiony.
- Cooldown w czasie symulacji. Gotowa wieża bez celu pozostaje gotowa; ulepszenie zachowuje cooldown.
- Trzy poziomy wież i produkcji mobów, prawidłowe koszty, `MAX_LEVEL`, statystyki tylko nowo produkowanych mobów i zwrot połowy pełnych wydatków po sprzedaży.
- Paski zdrowia, znaczniki poziomów, lecące pociski i eksplozje obszarowe. Pauza i prędkość sterują także animacją, która nie wpływa na obrażenia.
- Demonstracja legalnie finansowana z salda: trzy poziomy obu wież, ciężkie moby z 225 i 300 HP, sprzedaż w 160 s i remis po 185,5 s.

## Weryfikacja

- `npm run typecheck`: zaliczone.
- `npm test`: 56 testów w 8 plikach, wszystkie zaliczone.
- `npm run build`: zaliczony build produkcyjny.
- Testy walki obejmują cel, zasięg, strzał przez wieże, trafienie obszarowe na granicy promienia, wspólne trafienia, pojedynczą nagrodę, gotowość bez celu, cooldown i śmierć przed dotarciem do bazy.
- Testy ulepszeń obejmują oba typy, poziomy 1–3, koszty i zwroty, zachowanie statystyk już istniejących mobów, limity i nieudane akcje bez mutacji.
- Testy animacji obejmują deduplikację strzału, czas lotu/eksplozji, śledzenie celu, zachowanie zdarzeń i zdrowia oraz pauzę i prędkość. Test interfejsu sprawdza przekazanie pauzy i prędkości do renderera.
- Pełny stan końcowy jest identyczny dla wszystkich prędkości, nieregularnych klatek, zmian prędkości i pauz.
- axe-core w jsdom: brak automatycznych naruszeń WCAG A/AA w początkowym i końcowym interfejsie HTML; reguła kontrastu wymaga rzeczywistego renderowania.
- Podgląd GPU wymaga ręcznego odbioru. Wcześniejsza próba sterowania lokalną stroną została zablokowana przez politykę narzędzia przeglądarki; blokady nie obchodzono.

## Odbiór użytkownika

README.md zawiera kroki uruchomienia, harmonogram i kolejność czytania kodu. Szczególnie sprawdź lecące pociski przy 0,5×/1×, eksplozje, paski zdrowia, znaczniki poziomów i zatrzymanie lotu przy pauzie. Logi pokazują zabicia, nagrody, ulepszenia i sprzedaż.

Start przygotowuje akcje i walkę kroku 0 bez ruchu. Następny odstęp 0,1 s przesuwa wyłącznie żywe moby i sprawdza wynik; jeśli mecz trwa, nalicza przychód oraz przygotowuje kolejne akcje i walkę. Prezentacja odczytuje rozstrzygnięte strzały i odtwarza ich lot osobno.

Faza 3 została wypchnięta w commicie `0a8eefc`. Zmiany fazy 4 zatwierdzono do zapisu i publikacji. Interfejs strategii JavaScript i przykładowe skrypty powstaną w fazie 5.
