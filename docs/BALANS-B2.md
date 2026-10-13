# Balans B2 i kolejka wypuszczania

Data: 2026-10-13. Gotowe do przeglądu po fazie 5; faza 6 pozostaje nierozpoczęta.

## Wprowadzone zasady

- Bazowy przychód: 30 G/s. Udany zakup podstawowego moba dodaje trwałe 0,2 G/s, ciężkiego 0,6 G/s. Limit wynosi 90 G/s łącznie. Bonus zostaje po śmierci lub przepuszczeniu jednostki. Pierwsza wypłata jest w ticku 1; nieudane zakupy i ulepszenia nie dodają bonusu.
- Wybuch trafia najwyżej sześć żywych mobów w promieniu 1,5 pola. Cel główny zawsze jest wśród ofiar; pozostali są wybierani według odległości od niego, następnie ID. Wszystkie wieże wybierają ofiary ze stanu przed obrażeniami, nagroda jest wypłacana raz.
- Nagrody za zabicie: 1 G za podstawowego, 3 G za ciężkiego. Ulepszenia produkcji każdego typu kosztują 100/200 G.
- Zakup całej fali rozlicza koszt, statystyki, ID i bonusy od razu. Pierwszy mob wchodzi od razu, jeśli wejście jest gotowe, kolejni co 0,2 s czasu symulacji. Osobne kolejki FIFO obsługują obie strony i oba typy jednostek. Oczekujący mob nie porusza się, nie blokuje budowy i nie jest celem wieży. Przy wejściu jego dystans jest przeliczany względem bieżącego labiryntu.
- Pauza zatrzymuje kolejkę, wznowienie zachowuje pozostały odstęp, nowy mecz usuwa oczekujące jednostki. Prędkość odtwarzania nie zmienia rozstawu w czasie gry. Moby nadal mogą przechodzić przez siebie i wyprzedzać się.

Obie domyślne strategie przeznaczają 60% przychodu na atak i budują trzy ściany z naprzemiennymi przejściami. Wielkość fal rośnie z przychodem, aby strategia mogła wykorzystać bonus produkcji. Po maksymalnym ulepszeniu produkcji jej budżet trafia do ataku. Linia na planszy przedstawia najkrótszą drogę, a interfejs pokazuje aktualny przychód, liczbę aktywnych mobów i długość kolejki.

## Wyniki sprawdzeń

- Sprawdzanie typów: zaliczone.
- Testy: 81 w 11 plikach, wszystkie zaliczone. Obejmują bonusy i ich limit, odrzucone zakupy, trwałość po śmierci/przepuszczeniu, nowe nagrody i koszty, limit i kolejność ofiar wybuchu, jednoczesne trafienia, FIFO, odstępy, oddzielne kolejki, statystyki przy zakupie, przeliczanie trasy przy wejściu, pauzę/reset i identyczny stan końcowy przy wszystkich prędkościach.
- Produkcyjny build: zaliczony. W sandboxie proces kończył się SIGABRT bez diagnostyki; build wykonany poza sandboxem z `NG_BUILD_MAX_WORKERS=2` zakończył się poprawnie.
- axe-core w jsdom: testy początkowego i końcowego interfejsu HTML zaliczone, bez kontroli kontrastu wymagającej renderowania.
- 25 pojedynków pięciu polityk, z obiema kolejnościami stron i lustrzanymi meczami: wszystkie zakończyły się w 32,2–107 s. Zamiana stron dała identyczny czas i odwrócone przepuszczenia oraz wynik; mecze identycznych strategii zakończyły się remisem.
- Domyślny mecz: gracz 1 wygrywa po 32,2 s, przepuszczenia 1/20, zakupy 88/26 mobów, 6/7 wież, przychód końcowy 47,6/45,6 G/s. Najdłuższe trasy mają 21/23 pola wobec początkowych 15. Zakupy obejmują też jednostki jeszcze oczekujące przy zakończeniu meczu.

Dane: [BALANS-B2-WYNIKI.json](BALANS-B2-WYNIKI.json). Polityka szybkiego naporu wygrywa ze wszystkimi czterema pozostałymi, a ciężka przegrywa z nimi; seria potwierdza działanie nowych reguł i brak przewagi numeru gracza, ale nie równą siłę wszystkich przykładowych strategii. Mecz nadal nie ma limitu czasu; 300 s jest wyłącznie ograniczeniem eksperymentu.

Rzeczywisty obraz PixiJS pozostaje do ręcznego odbioru. Dostęp narzędziowy do lokalnej strony był wcześniej zablokowany przez politykę przeglądarki; blokady nie obchodzono. Historyczna analiza ofensywy w osobnym dokumencie i jej skrypty pozostają zachowane.

## Powtórzenie i odbiór

```sh
npm run balance -- --profile=active --limit=300 --output=docs/BALANS-B2-WYNIKI.json
npm run balance -- --profile=active --quick
```

Po uruchomieniu przez `npm start` odśwież stronę i kliknij Start. Sprawdź kolejkę na początku fali, rosnący przychód, wydłużenie drogi po budowie i pauzę podczas wypuszczania. Przy 0,5× odstęp odpowiada 0,4 s czasu rzeczywistego; przy 4× jest znacznie krótszy. Nowy mecz powinien wrócić do pustych kolejek i 30 G/s.

Kolejność przeglądu: `src/game/config/game-config.ts`, `engine/actions.ts`, `economy.ts`, `combat.ts`, `spawning.ts`, `step.ts`, `strategy/snapshot.ts`, `src/strategies/tactics.js`. Publiczne pola `income`, `queuedMobs` i `outgoingQueue` są opisane w API-STRATEGII.md. Testy znajdują się obok kodu.

Zmiany pozostają lokalne do przeglądu i polecenia commit/push.
