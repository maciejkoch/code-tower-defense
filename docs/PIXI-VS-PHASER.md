# PixiJS czy Phaser od MVP.0

Status: PixiJS zatwierdzone przez użytkownika od MVP.0. Data: 2026-10-12.

## Kontekst projektu

Angular odpowiada za sterowanie, statystyki, logi i przyszły edytor. Gra ma własny deterministyczny silnik TypeScript: kroki 0,1 s, najkrótsze trasy, ekonomia i walka. Fizyka i kolizje frameworka nie są potrzebne. Renderowanie nie może zmieniać wyniku. Obie biblioteki można zastosować już do prostych kształtów, a później do sprite’ów; żadna nie zastępuje przygotowania grafik.

## Porównanie

| Kryterium | PixiJS | Phaser |
|---|---|---|
| Zakres | Biblioteka renderowania 2D | Framework gier 2D z systemami scen, wejścia, animacji, kamer, fizyki i efektów |
| MVP.0 | Kształty jako Graphics i kontenery obu pól | Kształty jako obiekty sceny |
| MVP.1 | Sprite’y, tekstury, animowane klatki; własne sterowanie prezentacją | Sprite’y, animacje i przejścia wspierane przez systemy frameworka |
| Własny silnik | Naturalny podział: renderer odczytuje stan | Możliwy, ale trzeba świadomie utrzymać logikę poza scenami, fizyką i timerami |
| Przyspieszanie / bez animacji | Własny sterownik kroków; renderer opcjonalny | Ten sam sterownik; nie opieramy zasad na delta sceny ani timeScale frameworka |
| Angular | Komponent utrzymuje instancję Pixi i kontener DOM | Komponent utrzymuje instancję Game i przekazuje stan do sceny |
| Co piszemy sami | Sterowanie wizualnymi przejściami, powiązanie zdarzeń z efektami; dodatkowe funkcje zależnie od potrzeb | Głównie powiązanie stanu z obiektami sceny; więcej narzędzi prezentacji jest gotowych |
| Co będzie niewykorzystane | Stosunkowo mało systemów poza rendererem | Część systemów gry, zwłaszcza fizyka i logika scen, bo zasady są w naszym silniku |
| Dalszy rozwój | Dobry do gry jako części aplikacji Angular | Dobry, gdy rozwój wymaga wielu scen, kamer, audio, efektów i rozbudowanego wejścia |
| Testy zasad | Czysty silnik testowany bez biblioteki i przeglądarki | Tak samo, pod warunkiem zachowania osobnego silnika |

Dopasowanie i ocena nakładu pracy są wnioskami architektonicznymi dla tego projektu, nie benchmarkiem. Nie porównujemy rozmiaru paczek ani szybkości bez pomiaru tej samej sceny i konkretnych wersji.

## Wspólny kontrakt renderera

- `mount(container, assets)` — inicjalizacja grafiki.
- `render(previousState, currentState, interpolation, events)` — prezentacja migawki i zdarzeń wizualnych.
- `resize(width, height)` — dopasowanie powierzchni.
- `destroy()` — zatrzymanie pętli i zwolnienie zasobów.

Silnik nie importuje Angulara ani biblioteki graficznej. Renderer nie wywołuje akcji strategii i nie przyznaje obrażeń. Katalog wyglądu mapuje typy i poziomy na kształt lub sprite; zdarzenia takie jak atak, śmierć i ulepszenie uruchamiają wyłącznie efekty wizualne. Interpolacja wygładza ruch między krokami i nie zmienia położenia w silniku.

W obu wariantach jedna warstwa koordynuje odtwarzanie; nie uruchamiamy dwóch niezależnych pętli zmieniających stan. Angular otrzymuje dane paneli, a nie osobny komponent dla każdego moba. Nowy mecz i usunięcie komponentu muszą czyścić obiekty, nasłuchy i zasoby.

## Rekomendacja

PixiJS od MVP.0. Najlepiej pasuje do Angulara i własnego silnika, które już pokrywają interfejs oraz zasady gry. Od razu rysujemy kształty przez Pixi, a w MVP.1 zmieniamy katalog wyglądu na grafiki. Nie budujemy tymczasowego renderera Canvas 2D.

Phaser wybrałbym, jeśli od początku priorytetem byłyby rozbudowane sceny, kamery, dźwięk i liczne efekty, a zespół chciałby korzystać z jednego frameworka do tych funkcji. Nadal zachowujemy oddzielny silnik symulacji.

PixiJS i Phaser używają elementu canvas, ale renderer GPU nie jest tym samym co CanvasRenderingContext2D. Wybór biblioteki zastąpi wcześniejszy wymóg bezpośredniego Canvas 2D, zachowując grafikę 2D w przeglądarce. Dokładną stabilną wersję i wymagania przeglądarek sprawdzimy przed instalacją; nie mieszamy dokumentacji różnych głównych wersji Phaser.

## Źródła

- PixiJS: https://pixijs.com/8.x/guides/concepts/architecture
- Kształty: https://pixijs.com/8.x/guides/components/scene-objects/graphics
- Pętla prezentacji: https://pixijs.com/8.x/guides/components/ticker
- Phaser: https://phaser.io/phaser4
- System scen (dokumentacja Phaser 3; szczegóły wersji 4 trzeba sprawdzić oddzielnie): https://docs.phaser.io/phaser/concepts/scenes
