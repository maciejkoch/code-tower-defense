# Stack i infrastruktura

Data: 2026-10-12. Status: cały stack i infrastruktura zatwierdzone przez użytkownika; faza 1 zaakceptowana, faza 2 zaimplementowana i oczekuje na odbiór.

- TypeScript dla silnika i interfejsu; strategie graczy pozostają w JavaScript.
- Angular 22 i Angular CLI 22 do uruchamiania i budowania aplikacji. Dokładne zgodne wersje poprawek zostaną sprawdzone i przypięte podczas inicjalizacji.
- Standalone components, Signals do stanu interfejsu i tryb zoneless, o ile integracje nie ujawnią konkretnej przeszkody. Aplikacja renderowana po stronie klienta, bez SSR.
- Nowe formularze korzystają z Signal Forms; nie dodajemy formularzy wyłącznie w celu użycia tej funkcji.
- Nazwy plików i klas bez sufiksów technicznych Component/Service oraz `.component`/`.service`, np. `board.ts` i `match-store.ts`. Testy zachowują `.spec.ts`.
- Stosujemy oficjalne skille Angulara wskazane na https://angular.dev/ai/agent-skills, w szczególności `angular-developer`, oraz oficjalny style guide. Przy inicjalizacji sprawdzamy także `angular-new-app`.
- PixiJS od MVP.0 do plansz i jednostek: proste kształty na start, sprite’y i animacje w MVP.1. Angular i HTML/CSS obsługują przyciski, statystyki oraz logi.
- Vitest przez narzędzia Angular CLI do testów silnika i istotnych zachowań interfejsu.
- Node.js i npm jako narzędzia lokalne oraz CI; zgodne wersje zostaną przypięte przy inicjalizacji.
- GitHub Actions do sprawdzania typów, testów i buildu.
- Hosting statyczny: GitHub Pages. Zatwierdzony tryb deploymentu: ręczne uruchomienie workflow w GitHub Actions (`workflow_dispatch`); sam push nie publikuje strony. Po uruchomieniu workflow budowanie i publikacja są automatyczne. Pierwsze włączenie hostingu podczas etapu deploymentu.
- Bez backendu i bazy danych w MVP.0: mecz i strategie działają lokalnie w przeglądarce.

## Podział aplikacji

- `engine`: czysty TypeScript: stan, ekonomia, ruch, walka i krok symulacji; bez Angulara, DOM, Canvas i zegara rzeczywistego.
- `strategy`: migawki, API, pamięć i wykonanie kodu.
- `renderer`: prezentacja stanu i zdarzeń przez PixiJS; osobny katalog wyglądu typów jednostek.
- `ui`: komponenty Angular do sterowania, statystyk i logów; instancja PixiJS w komponencie planszy.
- `config`: jeden centralny moduł parametrów gry.
- `strategies`: dwa pliki JavaScript graczy.

Sterownik odtwarzania wykonuje kroki o stałej długości. Renderowanie tylko odczytuje stan. Zmiana prędkości wpływa na tempo kroków, a przyszły tryb bez animacji użyje tego samego silnika. Brak izolacji kodu gracza w MVP.0 oznacza, że kod blokujący wykonanie może zablokować interfejs; obsługa takich przypadków należy do odłożonej walidacji/izolacji.

Rozszerzenie online będzie wymagało backendu do prowadzenia meczu; oddzielenie silnika od przeglądarki umożliwi ponowne użycie zasad gry.

Zmiana propozycji po sugestii użytkownika: Angular zastępuje samodzielny zestaw Vite + HTML/CSS. PixiJS od MVP.0 zatwierdzono 2026-10-12. Angular, PixiJS, Vitest, GitHub Actions, GitHub Pages i ręczny deployment zatwierdzono 2026-10-12.

Źródła:
- https://angular.dev/reference/releases
- https://angular.dev/guide/testing
- https://angular.dev/reference/releases
- https://angular.dev/guide/testingstatic-deploy.html#github-pages
- https://vitest.dev/guide/

## Zatwierdzona architektura grafiki

- Silnik TypeScript nie zależy od PixiJS ani Angulara.
- Renderer odczytuje stan i zdarzenia; animacje nie wpływają na zasady ani wynik.
- Katalog wyglądu pozwala zastąpić kształty grafikami bez zmian w silniku i API strategii.
- Stałe kroki symulacji są niezależne od pętli renderowania, co umożliwia zmianę prędkości i przyszłe rozegranie bez animacji.
- Nie tworzymy tymczasowego renderera bezpośrednio w Canvas 2D. PixiJS prezentuje grafikę 2D w elemencie canvas z rendererem GPU.

## Wersje przypięte w fazie 1

Angular i CLI 22.2.2, PixiJS 8.22.0, TypeScript 6.0.3, Vitest 5.0.4, Node 22.23.2, npm 12.0.2. Domyślny zoneless i OnPush Angulara 22, bez Zone.js. Wersje zależności są dokładne, z package-lock.json.
