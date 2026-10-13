# Analiza zasad promujących ofensywę

Data: 2026-10-13. Status: propozycje i eksperymenty, bez wdrożenia zmian w grze.

Wniosek: produkcja mobów powinna zwiększać przyszłe możliwości gracza. Obecnie
wieże są trwałą inwestycją, a mob jest wydatkiem, który po śmierci dodatkowo
finansuje przeciwnika. Samo zwiększanie liczby mobów nie usuwa tej asymetrii.

## Punkt odniesienia

Podczas analizy lokalna konfiguracja zmieniła się z pierwotnej na B1. Wyniki
poniżej dotyczą B1: 30 G/s, podstawowy mob za 10 G, ciężki za 30 G, podstawowa
wieża za 50 G z 15 obrażeniami co 0,5 s, nagrody 2/5 G, mnożniki HP 1/2/6.
Wcześniejsza seria sześciu pojedynków na pierwotnych parametrach nie zakończyła
żadnego meczu do 180 s. Nie należy mieszać wyników tych konfiguracji.

B1 poprawia przykładowe pojedynki: strategia mieszana pokonuje ciężką po 152,1 s.
Jednak przeciw strategii wydającej cały budżet na obronę pięć badanych strategii
nie osiągnęło zwycięstwa do 300 s. Liczby przepuszczeń obrońcy wynosiły odpowiednio
3, 0, 15, 1 i 0. Próg porażki to 20. Mecz może się więc zakończyć, ale łatwo
zbudować strategię pod unikanie porażki.

Obrońca stawia trzy kolumny labiryntu z naprzemiennymi przejściami, reaguje
wieżami obszarowymi na skupiska i po zbudowaniu 33 wież ulepsza je. Nie produkuje
mobów. Atakujący to aktualne strategie mieszana i ciężka oraz trzy strategie
wydające budżet na sam atak: rój podstawowych, ciężkie bez ulepszeń i ciężkie
z rezerwą 30% wpływów na ulepszenia.

## Dlaczego obrona rośnie w siłę

1. **Wieża pozostaje na planszy.** Jednorazowy koszt daje ostrzał kolejnych fal
   bez utrzymania, zużycia ani możliwości zniszczenia przez przeciwnika.
2. **Nieudany atak pomaga obrońcy.** Nagroda 2 G przy koszcie 10 G przekazuje mu
   20% wydatku napastnika. Dla ciężkiego to około 16,7%. Nagroda nie jest jedyną
   przyczyną: jej całkowite usunięcie również nie rozwiązało zastoju.
3. **Ta sama wieża daje ostrzał i wydłuża drogę.** Labirynt wzmacnia użyteczność
   wszystkich wież znajdujących się przy kolejnych odcinkach trasy.
4. **Obrażenia obszarowe mają nieograniczoną liczbę celów.** Moby nakładają się.
   Jeśli 100 identycznych mobów idzie razem, wybuch uszkadza wszystkie. Dodawanie
   mobów do tej samej fali nie wydłuża koniecznie czasu jej zniszczenia.
5. **Budowa jest natychmiastowa.** Obrońca może reagować na widoczną falę i od razu
   strzelać nową wieżą. Atakujący musi jeszcze pokonać drogę do bazy.
6. **Ciężki mob też daje tylko jedno przepuszczenie.** Kosztuje trzy razy więcej,
   a porusza się dwa razy wolniej. Wyższe HP pomaga przebić próg ostrzału, lecz
   jego dotarcie do bazy nie ma większej wartości punktowej.

Zwiększenie stałego przychodu pomaga obu stronom. Mocniejsze, ale skończone
ulepszenia mobów przesuwają moment zastoju. Obniżenie progu porażki może natomiast
premiować początkowy all-in: badany rój przepuścił już 15 mobów, a następnie
obrona zatrzymała resztę meczu.

## Rozważane zmiany

| Zmiana | Wpływ na rozgrywkę | Ograniczenie / koszt |
|---|---|---|
| Przychód za produkcję mobów | Każdy atak inwestuje w dalszy rozwój, także gdy zostaje zatrzymany | Nieograniczony wzrost daje efekt kuli śnieżnej i bardzo dużo jednostek |
| Przychód za produkcję wygasający po 60 s | Wymaga ciągłego ataku zamiast jednorazowego rozwoju ekonomii | Bardziej złożony od stałego bonusu; nie został jeszcze zasymulowany |
| Mniejsze nagrody za zabicie | Ogranicza finansowanie przeciwnika | Samodzielnie nie rozwiązuje zastoju |
| Limit celów wybuchu lub stała pula obrażeń | Duże fale rzeczywiście mogą przeciążać obronę | Trzeba ponownie wyważyć wieżę obszarową względem podstawowej |
| Tańsze ulepszenia ofensywne | Wcześniejsze skoki siły i decyzja: fala teraz czy mocniejsza fala później | Maksymalny poziom nadal tworzy stały sufit |
| Narastające HP nowych mobów w późnej grze | Z czasem statyczna obrona traci bezpieczeństwo | Zmniejsza znaczenie końcowego układu wież; nie kończy meczu bez ataków |
| Utrzymanie wież | Wymusza ograniczony budżet obrony | Trzeba określić zadłużenie lub wyłączanie wież; samo obcięcie dochodu do zera nie usuwa już zbudowanej armii wież |
| Czas budowy i ulepszeń, np. 1–2 s | Tworzy okno dla szybkiego ataku i premiuje przewidywanie | Wymaga kolejki budowy i zmian API; trwałego zastoju nie rozwiąże samo |
| Ciężki mob zadaje 2–3 punkty obrażeń bazie | Urozmaica rolę jednostek i przyspiesza skuteczny atak | Bez przebicia obrony nie daje efektu |
| Mob burzący, pancerz, szybki mob | Pozwala aktywnie kontrować konkretne układy wież | Większa zmiana zakresu gry; wymaga nowych kontr i zasad trasowania |
| Narastające fale neutralne | Wymusza aktywne decyzje obronne nawet bez ataków | Może ponownie premiować samą obronę; powinny mieć zerową lub niską nagrodę |
| Limit czasu / remis za bezczynność | Zamyka mecze, w których nie ma rozstrzygnięcia | Sam nie zachęca do ataku; wymaga zmiany obecnego założenia o braku limitu |

Najbardziej obiecujący jest przychód za produkcję połączony z ograniczeniem
obrażeń obszarowych. Utrzymanie wież jest sensowną alternatywą, jeśli nie chcemy
przychodu zależnego od ataku, ale wymaga więcej nowych zasad. Nowe jednostki
lepiej rozważyć po ustabilizowaniu ekonomii.

## Eksperymenty na B1

Pakiet wsparcia ofensywy: nagrody 1/3 G, ulepszenia mobów za 100/200 G, maksymalnie
sześć celów wybuchu. Cel główny jest zawsze trafiony, pozostałe wybierane są według
odległości od niego, a remisy według ID. Parametry są kandydatami do testów.

Przychód ofensywny: każdy udany zakup zwiększa stały przychód o 2% ceny na sekundę.
Podstawowy mob dodaje 0,2 G/s, ciężki 0,6 G/s. Prosty zwrot następuje po 50 s;
reinwestowanie może przyspieszać rozwój. Bonus zaczyna działać od następnego kroku,
zostaje po śmierci moba i nie zależy od jego poziomu. W ograniczonym wariancie
łączny przychód nie przekracza 90 G/s.

Presja późnej gry: po 90 s HP **nowo produkowanych** mobów rośnie płynnie według
`2 ^ ((czas - 90) / 45)`. Przed 90 s mnożnik wynosi 1. To podwojenie co 45 s,
nie skokowa zmiana statystyk jednostek już obecnych na planszy.

| Pojedynek | Obecne B1 | Pakiet wsparcia | Pakiet + przychód do 90 G/s | Pakiet + przychód do 90 G/s + presja |
|---|---:|---:|---:|---:|
| Sama obrona kontra rój bez ulepszeń | >300 s | >300 s | >300 s | przegrana obrońcy: 169,4 s |
| Sama obrona kontra ciężkie z ulepszeniami | >300 s | >300 s | przegrana obrońcy: 55,9 s | 55,9 s |
| Sama obrona kontra strategia mieszana | >300 s | >300 s | przegrana obrońcy: 120,4 s | 120,4 s |
| Mieszana kontra ciężka | 152,1 s | 76,8 s | 52,2 s | 52,2 s |
| Mieszana kontra taka sama mieszana | remis: 150,5 s | remis: 94,5 s | remis: 48,5 s | remis: 48,5 s |
| Sama obrona kontra sama obrona | >300 s | >300 s | >300 s | >300 s |

`>300 s` oznacza brak rozstrzygnięcia w obserwowanym czasie, nie dowód, że gra
nigdy się nie zakończy. Dokładnie identyczne strategie na symetrycznych planszach
mogą remisować; taki wynik sam w sobie nie jest wadą.

Istotne próby dodatkowe:

- Przychód bez limitu i bez limitu celów wybuchu nie pokonał obrony samym rojem
  przez 300 s, mimo wyprodukowania około 67,6 tys. mobów i szczytu 6854 żywych.
  To pokazuje zarówno siłę AoE, jak i problem wydajnościowy takiej ekonomii.
- Limit sześciu celów przy nieograniczonym przychodzie pozwolił rojowi wygrać
  po 113,5 s, ale przychód atakującego doszedł do około 326 G/s.
- Ograniczenie przychodu do 90 G/s ograniczyło wzrost, lecz przywróciło zastój
  roju bez ulepszeń. Presja późnej gry rozstrzygnęła ten pojedynek po 169,4 s.
- Sam pakiet wsparcia przyspieszył przykładowy mecz, ale nie pokonał pełnej obrony.
  Wczesne zakończenie meczu dwóch przykładów nie wystarcza jako test balansu.

## Rekomendacja do następnej iteracji

Pierwszy kandydat: pakiet wsparcia i przychód ofensywny do 90 G/s. Produkcja mobów
staje się inwestycją, a obrońca ma powód do kontrataku, żeby utrzymać tempo ekonomii.
Próg 20 przepuszczeń pozostaje dobrym punktem odniesienia na tę próbę.

Stały przychód ma też słabość: gracz może najpierw osiągnąć limit przez atak,
a następnie przejść na samą obronę. Ten przełączany styl musi wejść do następnego
benchmarku. Jeśli stanie się dominujący, alternatywą jest wygasanie każdego bonusu
po 60 s, dzięki czemu większy dochód wymaga kontynuowania produkcji.

Presję późnej gry warto udostępnić jako oddzielny wariant. W badanych przypadkach
usuwa zastój także słabego roju, ale jest dodatkową regułą. Najpierw należy
sprawdzić, czy rozsądne przejście na ulepszone lub ciężkie moby wystarczy do
rozstrzygnięcia gry bez automatycznej eskalacji.

Do rozwiązania pozostaje obustronna pasywność. Propozycja: remis po 60 s bez
udanej produkcji mobów przez obie strony, jeśli na planszach nie ma żywych mobów.
Wtedy nawet długi marsz jednostki nie uruchamia tej reguły. Alternatywa: limit
240 s z remisem nierozstrzygniętego meczu. Oba warianty zmieniają zatwierdzone
założenie o braku limitu czasu; nie są wdrożone.

Następny benchmark powinien sprawdzić podziały budżetu atak/obrona 20/80, 40/60,
60/40 i 80/20, fale rozproszone i skupione, zmianę typu mobów, różne labirynty,
kontratak po rozwoju ekonomii oraz zamianę stron. Docelowy czas 60–180 s i
przewaga strategii mieszanych nad czystą obroną są proponowanymi kryteriami,
nie wynikiem już przeprowadzonego szerokiego testu.

## Powtarzalność i zakres weryfikacji

Wyniki: [wyniki.json](analizy/ofensywa-2026-10-13/wyniki.json). Zachowana
konfiguracja B1: [konfiguracja.json](analizy/ofensywa-2026-10-13/konfiguracja.json).
Zachowano również migawkę badanych taktyk, ponieważ lokalne strategie były
równolegle edytowane. Wyniki opisują te migawki, a nie wszystkie późniejsze
wersje przykładów. Ograniczony eksperyment można uruchomić z katalogu repozytorium:

```sh
node docs/analizy/ofensywa-2026-10-13/uruchom.mjs
```

Skrypt tworzy tymczasowy bundle silnika. Przychód jest doliczany przed strategiami,
zakupy śledzone przez opakowanie publicznego API, a modyfikacja AoE dotyczy wyłącznie
tego bundla. Nie zmienia kodu gry. Uruchamia 18 deterministycznych pojedynków do
300 s i odtwarza ostatnią grupę wyników w JSON.

To badanie wybranych strategii, nie pełny dowód balansu ani pomiar płynności UI.
W tabeli pakiety zmieniają kilka parametrów naraz; nie można przypisać całej
poprawy jednej liczbie. Prototyp dynamicznego przychodu nie rozszerza jeszcze
publicznego stanu strategii o przychód gracza. Przy wdrożeniu taka informacja
powinna być dostępna w API i widoczna w interfejsie.
