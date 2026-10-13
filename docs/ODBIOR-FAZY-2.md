# Odbiór fazy 2

Data: 2026-10-13. Status: zaakceptowana przez użytkownika, który zlecił commit, push i rozpoczęcie fazy 3.

## Dostarczony efekt

- Stały krok symulacji 0,1 s, niezależny od renderowania i prędkości odtwarzania.
- Najkrótsze trasy przez BFS od bazy; rozstrzyganie remisów według skonfigurowanej kolejności kierunków.
- Ruch po czterech kierunkach, przechodzenie przez zakręty i wiele krawędzi w jednym kroku; moby nie blokują się wzajemnie.
- Demonstracyjna produkcja moba podstawowego na obu polach co sekundę, przed ruchem. Kolor moba wskazuje gracza, który go wysłał.
- Przepuszczenia, zwycięstwo lub remis rozstrzygane po ruchu na obu polach tego samego kroku.
- Start, pauza, wznowienie, przerwanie, nowy mecz i prędkości 0,5×/1×/2×/4×.
- Wynik i przyczyna zakończenia w interfejsie; renderowanie jednostek w PixiJS.
- Zatrzymanie pętli klatek po zakończeniu meczu, podczas pauzy i po zniszczeniu widoku areny.

## Wyniki weryfikacji

- `npm run typecheck`: zaliczone dla aplikacji i testów.
- `npm test`: 20 testów w 4 plikach, wszystkie zaliczone.
- `npm run build`: zaliczony build produkcyjny.
- Testy integracyjne porównują pełny stan końcowy z referencją bez zegara, dla każdej prędkości, nieregularnych klatek, zmiany prędkości i pauzy.
- Domyślna demonstracja: tick 265, czyli 26,5 s, remis, po 20 przepuszczeń.
- Test interfejsu sprawdza sterowanie, przekazywanie pozycji do renderera, reset, zatrzymanie klatek i zachowanie fokusu przy zmianie Start → Pauza → Wznów.
- axe-core: brak automatycznych naruszeń WCAG A/AA w początkowym i końcowym widoku HTML. Test działa w jsdom bez reguły kontrastu wymagającej renderowania.
- Przegląd w prawdziwej przeglądarce: niewykonany. Narzędzie sterowania przeglądarką odrzuciło dostęp do `http://127.0.0.1:4200/` przez swoją politykę bezpieczeństwa. Nie obchodzono blokady. Rzeczywisty obraz mobów i układ nowych przycisków należy sprawdzić ręcznie według README.md.

## Do przeglądu

Scenariusz uruchomienia i kolejność czytania kodu: README.md → „Odbiór fazy 2” i „Kolejność przeglądu kodu fazy 2”.

Ekonomia, budowanie labiryntu, walka i strategie zostają w kolejnych fazach. Na pustej planszy demonstracja pokazuje prostą trasę; zakręty i przeszkody są sprawdzone automatycznie. Demo nie pobiera złota i nie nalicza przychodu.

Faza 1 jest zapisana i wypchnięta jako `2c4449f`. Zmiany fazy 2 zostały zatwierdzone do zapisu i publikacji. Następny etap: faza 3.
