# Ręczna publikacja GitHub Pages

Przygotowane w fazie 6. Pierwsze włączenie Pages i uruchomienie workflow należą do fazy 7, po odbiorze lokalnym i zleceniu publikacji.

## Kontrole przed publikacją

```sh
npm ci
npm run check
npm run balance -- --profile=active --quick --verify --limit=300
npm run build:pages
```

`npm run check` sprawdza typy, testy, build dla `/` i jego pliki. Wariant Pages ma `<base href="/code-tower-defense/">`; pliki znajdują się w `dist/code-tower-defense/browser`. Kontrola sprawdza base href, zasoby HTML oraz statyczne i dynamiczne względne importy fragmentów JavaScript. To weryfikacja plików, nie wykonania WebGL w przeglądarce.

Korzystaj ze skryptów npm do buildu. `tools/build.mjs` ustawia `NG_BUILD_OPTIMIZE_CHUNKS=false`, ponieważ przy przypiętym Angular CLI 22.2.2 dodatkowy optymalizator pozostawia fragment PixiJS BitmapFont z importami do usuniętych plików. Minifikacja produkcyjna i hashowane nazwy pozostają włączone. Podobny błąd opisano w [Angular CLI #34292](https://github.com/angular/angular-cli/issues/34292). Obejście jest potwierdzone lokalnym buildem i kontrolą importów; można je usunąć po aktualizacji narzędzi i ponownej weryfikacji.

## Pierwsza publikacja — faza 7

1. Zatwierdź i wypchnij pliki fazy 6 na `main`.
2. W repozytorium GitHub otwórz **Settings → Pages → Build and deployment** i ustaw **Source: GitHub Actions**.
3. W **Actions → Deploy GitHub Pages manually → Run workflow** wybierz gałąź **main** i uruchom workflow.
4. Poczekaj na zakończenie zadań `build` i `deploy`. Docelowy adres: `https://maciejkoch.github.io/code-tower-defense/`.
5. Sprawdź obie plansze, start, cały mecz, pauzę, prędkości, logi i nowy mecz pod opublikowanym adresem w Chrome i Firefox.

Workflow wdrożenia ma wyłącznie `workflow_dispatch`; sam push uruchamia kontrole CI. Budowanie i testy poprzedzają wysłanie artefaktu Pages, a publikacja zależy od ich powodzenia. Uprawnienia zapisu Pages i token OIDC ma zadanie `deploy`. Przygotowanie opiera się na [oficjalnym workflow Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Kolejne publikacje

Po wypchnięciu zaakceptowanego kodu ponownie uruchom **Deploy GitHub Pages manually** na `main`. Workflow buduje wybrany commit; zmiana pliku strategii wymaga nowego buildu i publikacji. Podgląd adresu publicznego nie jest automatycznie aktualizowany przez lokalny serwer.

## Powrót do wcześniejszej wersji

Przywróć wybrany zaakceptowany stan kodu w nowym commicie na `main`, wypchnij go i ręcznie uruchom publikację. Nie jest potrzebny force push ani usuwanie historii.
