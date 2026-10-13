# Chochlik — arkusz biegu

Wygenerowano wbudowanym narzędziem image_gen na podstawie zaakceptowanej próbki. Plik produkcyjny: `public/assets/mobs/chochlik/walk.png` (1254 × 1254, RGBA z przezroczystością). 16 klatek: wiersze wschód, południe, zachód, północ; po cztery fazy biegu. Granice przezroczystych sprite’ów zapisano w `src/game/renderer/chochlik-frames.ts`, żeby wyeliminować przesunięcia wynikające z odstępów w wygenerowanym arkuszu. Cienie, błysk trafienia, pojawienie i zniknięcie realizują `mob-animation.ts` i `mob-layer.ts`.

## Prompt

```text
Use case: stylized-concept.
Asset type: production game sprite sheet, transparent PNG, exactly 4 columns by 4 rows, 16 animation frames, square canvas.
Reference image role: STYLE AND CHARACTER REFERENCE ONLY. Use only the small purple horned chochlik monster in the reference. Do not reproduce its arena, towers, text, golem or decorative background.
Create a perfectly registered 4x4 sprite sheet of that SAME agile small hunched bipedal purple imp, two pale ivory horns, long pointed ears, glowing amber eyes, empty hands, digitigrade feet. Muted mauve-purple leathery skin, lighter face, no fur, no clothing, no armor, no weapon. Polished hand-painted medieval fantasy game sprite art, bold readable forms simplified for a 28-pixel-tall in-game unit.
STRICT CAMERA: overhead three-quarter top-down game camera about 60 degrees above ground, orthographic. All directions use the SAME overhead camera, scale, upper-left soft lighting and monster design. No side-view eye-level portraits.
STRICT GRID: split the square canvas into 16 equal invisible cells, 4 columns and 4 rows. Each cell has exactly one complete monster centered horizontally, same ground/pelvis registration, same apparent body size, with ample transparent padding. Each monster including limbs fits inside the central 70% of its cell and never crosses cell boundaries. No labels, borders, grid lines or ground platforms. Actual transparent background, NOT checkerboard art, no background tint. No painted cast shadows, renderer supplies shadows.
ROW 1: walking EAST, facing screen RIGHT, four sequential distinct gait frames.
ROW 2: walking SOUTH, facing screen DOWN toward camera, four sequential distinct gait frames.
ROW 3: walking WEST, facing screen LEFT, four sequential distinct gait frames.
ROW 4: walking NORTH, facing screen UP away from camera, show BACK of head and back, four sequential distinct gait frames.
COLUMNS 1 through 4 form a seamless walk cycle: left foot forward contact; passing pose; right foot forward contact; opposite passing pose. Alternate visible leg placement and natural opposing arm swing, subtle body bob only, identical anatomy across all frames. The gait is brisk purposeful movement without attacking, never lunging, punching or slashing. Keep rows evenly aligned and every sprite at consistent scale.
Constraints: exactly sixteen sprites, no extra sprites, no text, no watermark, no effects or particles. Frame poses must really differ, not sixteen identical copies. Preserve pale paired horns and purple character identity from reference.
```
