# Grafika średniowiecza

Zastąpiono geometryczne jednostki grafikami zaakceptowanego świata: nieuzbrojone chochliki i kamienne golemy próbują dotrzeć do bramy, a kusze i katapulty bronią planszy. Moby wyłącznie przemieszczają się; nie mają animacji atakowania.

## Zasoby i animacje

| Etap | Plik w `public/assets/` | Animacja |
| --- | --- | --- |
| 1. Chochlik | `mobs/chochlik/walk.png` | 4 kierunki, po 4 fazy biegu; pojawienie, błysk trafienia i zniknięcie |
| 2. Golem | `mobs/golem/walk.png` | 4 kierunki, po 4 fazy ciężkiego chodu; pojawienie, błysk trafienia i zniknięcie |
| 3. Plansza | `board/terrain.png`, `board/gate.png` | Trawa w dwóch wariantach, droga, bruk i brama; animowane pochodnie |
| 4. Kusza | `towers/crossbow.png` | 8 kierunków celowania, napięta i zwolniona cięciwa, odrzut; lecący bełt |
| 5. Katapulta | `towers/catapult.png` | 8 kierunków celowania, napięte i zwolnione ramię; kamień po łuku, pył i odłamki |

Wszystkie PNG wygenerowano wbudowanym `image_gen`. [Prompt chochlika](art-concepts/2026-10-13/chochlik-walk-prompt.md) i [pozostałe prompty](art-concepts/2026-10-13/medieval-assets-prompts.md) są zapisane razem z wcześniejszymi próbkami. Cztery arkusze jednostek mają po 16 klatek. Ich przezroczyste granice i punkty wyrównania zapisano w plikach `*-frames.ts`; brama ma osobne granice w `board-art.ts`.

## Integracja

- `mob-animation.ts` i `tower-animation.ts` prowadzą wyłącznie stan prezentacji. Odczytują migawki silnika i jego zdarzenia ataków; nie modyfikują jednostek, obrażeń ani czasu symulacji.
- `mob-layer.ts` i `tower-layer.ts` utrzymują sprite’y według ID, współdzielą tekstury i zwalniają usunięte jednostki. Oba pola korzystają z tych samych załadowanych atlasów. Kolorowe obwódki, paski zdrowia i znaczniki poziomów zachowują rozróżnienie graczy.
- `board-surface.ts` układa tekstury drogi na aktualnej najkrótszej trasie wyznaczonej przez istniejące trasowanie. Zmiana labiryntu aktualizuje drogę. Pochodnie wykorzystują czas prezentacji.
- `art-assets.ts` ładuje grafiki względem HTML `<base>` i włącza filtrowanie mipmap, aby ograniczyć migotanie detali przy pomniejszaniu do pól 36 px. Działa też prefiks `/code-tower-defense/`.
- Pauza zatrzymuje kroki, obracanie, odrzut, pociski, pył i pochodnie. Prędkość 0.5×–4× skaluje prezentację. Nowy mecz czyści sprite’y i efekty, także historię zdarzeń ataków.
- Lot i wybuchy są efektami graficznymi; reguły oraz moment naliczania obrażeń pozostają w silniku.

## Weryfikacja

- `npm run check`: typy, **102 testy**, produkcyjny build oraz kontrola importowanych chunków i wszystkich sześciu nowych PNG — PASS.
- `npm run build:pages`: build z prefiksem `/code-tower-defense/` oraz kontrola zasobów — PASS.
- Chrome z WebGL: dwa pola, animowane jednostki, kierunki celowania, bełty i kamienie, pauza, zmiana prędkości podczas pauzy, reset, ponowny mecz, brak błędów strony i brak niedostępnych zasobów — PASS.
- Osobna scena w przeglądarce zawierała oba typy mobów, oba typy wież i znaczniki ulepszeń. Trafienia obniżały HP, a pauza zamrażała cały obraz także z aktywnymi efektami — PASS.
- Domyślne strategie nadal kończą mecz wygraną gracza 1 po **32.2 s** symulacji.

## Podgląd

Uruchom `npm start`, otwórz `http://localhost:4200/`, wybierz 0.5× i kliknij **Start**. Pauza pozwala obejrzeć klatkę ruchu lub odrzutu. **Nowy mecz** rozpoczyna czysty przebieg.

[Podgląd końcowego meczu](art-concepts/2026-10-13/iteration-5-combat.png) · [Scena z kuszą i katapultą](art-concepts/2026-10-13/final-towers-scene.png).
