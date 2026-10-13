# Prompty zasobów średniowiecza

## Kusza

```text
Use case: stylized-concept.
Asset type: production transparent 4-column x 4-row sprite atlas, sixteen frames of ONE medieval crossbow tower.
Reference role: use ONLY the small limestone tower with mounted crossbow in the reference as style/structure reference. No arena, text, golem, imp or other structures.
Sprite design: compact squat circular warm limestone tower, small dark wooden mounted siege crossbow on its flat top, short oak stock, broad bow limbs and visible string, tiny muted blue banner on the front. Empty foundation, no bushes, no ground platform, no shadow, no crew. Clear hand-painted 2D medieval game art with simplified readable details for a 32-pixel-wide tower.
Camera: orthographic steep overhead about 65 degrees above ground. SAME stationary stone tower silhouette, same banner facing the bottom of screen, same base lighting from upper left in EVERY frame; ONLY the mounted crossbow rotates to aim. Never rotate the stone base or switch the camera.
STRICT 4x4 equal-cell grid on square canvas, every complete sprite centered and fitting within the central 70% of its cell, ample transparent gutters between all sprites. No overlap, no captions, borders or checkerboard pattern; genuine alpha background, no glow or cast shadow.
First eight frames are LOADED idle:
ROW 1 columns 1–4: weapon points EAST/right; SOUTH-EAST/down-right; SOUTH/down; SOUTH-WEST/down-left.
ROW 2 columns 1–4: weapon points WEST/left; NORTH-WEST/up-left; NORTH/up; NORTH-EAST/up-right.
Next eight frames are FIRING/RECOIL, preserving the EXACT respective direction and same stone base registration:
ROW 3 columns 1–4: EAST, SOUTH-EAST, SOUTH, SOUTH-WEST, weapon string released, bolt absent, weapon subtly recoiled back.
ROW 4 columns 1–4: WEST, NORTH-WEST, NORTH, NORTH-EAST, same released recoil pose.
Loaded frames have a small bolt resting in the weapon; firing frames have no bolt loaded and released string. No flying projectiles or effect flashes painted outside the weapon, game renders them separately.
Constraints: exactly sixteen sprites, identical tower size and character of stonework, no animals, no real firearms, no swords, no text, no watermark.
```

## Katapulta

```text
Use case: stylized-concept.
Asset type: production transparent 4-column x 4-row sprite atlas, sixteen frames of ONE compact medieval catapult.
Reference role: use ONLY the wooden catapult in the provided reference as style and material reference, not the arena or other sprites.
Sprite: dark oak catapult mounted on a compact warm limestone square foundation, two stout timber supports, iron bands, short thick throwing arm and a round bowl holding a gray stone in the loaded state. No crew, no banners, no bushes, no shadow, no ground scenery. Polished hand-painted medieval 2D game art, bold simple shapes for a 32-pixel-wide sprite.
Camera: fixed orthographic steep overhead about 65 degrees above ground, same materials and light from upper left across all frames. All frames show the SAME square stone foundation aligned to the screen grid; only the wood siege mechanism aims/rotates on it. No eye-level side-view camera.
Exactly sixteen equally spaced sprites in a 4x4 equal invisible cell grid, same mechanism scale and stone foundation registration. Every complete sprite must fit within central 70% of its cell, generous clear transparent gutters, no overlap, no text, no lines or checkerboard painting. Genuine transparent background, no ambient glow.
First 8 frames LOADED/COCKED: throwing arm lowered backward with a stone in its bowl, poised to launch toward the specified direction.
ROW 1 columns 1–4: aiming EAST/right, SOUTH-EAST/down-right, SOUTH/down, SOUTH-WEST/down-left.
ROW 2 columns 1–4: aiming WEST/left, NORTH-WEST/up-left, NORTH/up, NORTH-EAST/up-right.
Last 8 frames RELEASED: arm swings up/forward, visibly different raised arm pose, EMPTY bowl, foundation unchanged.
ROW 3 columns 1–4: released EAST, SOUTH-EAST, SOUTH, SOUTH-WEST.
ROW 4 columns 1–4: released WEST, NORTH-WEST, NORTH, NORTH-EAST.
No flying rocks painted outside the machine, no impact effects in the atlas, game renders those separately. No modern guns, no characters, no letters or watermark.
```

Wszystkie zasoby wygenerowano wbudowanym image_gen. Referencja stylistyczna: `07-sredniowiecze-chochlik.png`. PNG są przechowywane w `public/assets/`; renderer odtwarza animacje bez zmiany reguł gry.

## golem

```text
Use case: stylized-concept.
Asset type: production game sprite sheet with actual transparent background, 4 columns x 4 rows, sixteen frames total.
Reference role: use ONLY the moss-covered stone golem in the provided reference as character/style reference. Do not copy the scene, towers, text or other monster.
Draw the SAME broad heavy unarmed stone golem as a walking game sprite: chunky gray-beige boulder plates, massive shoulders, short thick legs, small recessed head with softly glowing yellow eyes, patches of lush moss and a few tiny pale flowers. Empty hands hanging low. Friendly folklore monster, not a real animal, no weapons, no armor, no attack poses. Polished hand-painted medieval fantasy game art with strong simple readable shapes and crisp edges.
Camera: fixed orthographic steep overhead three-quarter view for a top-down square-grid game, 60 degrees above ground. Same upper-left soft light, same anatomy and scale throughout all sixteen frames. No side-view portrait camera.
Strict layout: exactly four equally spaced rows and four equally spaced columns on a square transparent canvas. Every complete sprite fits comfortably inside the central 70% of its own equal cell, including feet and shoulders. Ample empty transparent gutters between all sprites; no overlap, no labels, no grid lines, no painted checkerboard, no ground, no shadows.
Row 1: golem walking EAST toward screen RIGHT.
Row 2: golem walking SOUTH toward screen DOWN, front visible.
Row 3: golem walking WEST toward screen LEFT.
Row 4: golem walking NORTH toward screen UP, back visible.
Columns 1–4: four DISTINCT sequential phases of a seamless heavy lumbering walk cycle: left foot forward contact, passing pose, right foot forward contact, opposite passing pose. Real alternate leg movement and restrained opposite arm swing with slight heavy shoulder bob, but never attacking. Keep identical head/shoulder scale and foot ground registration in every cell.
Constraints: exactly sixteen golems, no extra sprites or effects, no texts, no watermark, genuine alpha transparency.
```

## terrain

```text
Use case: stylized-concept. Asset type: production 2D top-down terrain tile atlas, square image divided into exactly 2 columns and 2 rows, four equal square seamless tile textures with NO gaps, borders or text.
Style reference: only use the terrain materials and painterly medieval palette in the reference, not the whole scene.
Entire square canvas filled edge to edge with four distinct tiles, each quadrant must fill its exact square fully. Camera straight down orthographic, flat ground, no raised 3D slabs or beveled tile edges, no perspective.
TOP LEFT: buildable grass tile, muted sage and olive grass, sparse tiny tufts, quiet low-contrast hand-painted texture, plain uncluttered center.
TOP RIGHT: second buildable grass variant, same muted sage/olive palette and same edges, a few tiny gray flecks and subtly different tufts. Not flowers or decorative bushes, still very quiet.
BOTTOM LEFT: path tile, pale warm sand/earth, lightly worn dirt with tiny gravel flecks, quiet low contrast and much brighter than purple monsters. Flat ground texture with no painted path edge or road shape; game tiles it dynamically.
BOTTOM RIGHT: base/entry stone paving tile, desaturated warm beige gray small weathered cobblestones with subtle moss in cracks, no symbols.
Each individual quadrant texture should tile seamlessly with itself, no obvious center vignette, no dark edge framing, no cross-quadrant texture spill. Restrained detail so towers and mobs stay readable when a tile is scaled to 36 pixels. Polished hand-painted game textures matching the reference. No characters, buildings, props, shadows, captions or watermark.
```

## gate

```text
Use case: stylized-concept. Asset type: one production transparent game sprite of a medieval castle gate for a 2D top-down tower defense board.
Style reference: use the stone castle gate on the right side of the supplied reference as MATERIAL AND STYLE REFERENCE ONLY.
Draw a compact closed castle gate: weathered warm limestone arch, two very short chunky side piers, dark oak double door reinforced with iron, tiny muted blue hanging banner on each side, small unlit torch sconces on both piers. A single complete isolated compact structure, not a whole castle, no surrounding wall, no grass platform or scenery. Renderer will supply animated flames, so sconces have no painted flames or glow.
Fixed steep overhead three-quarter orthographic view, same top-down game camera as the mobs, facing downward toward viewer. Crisp hand-painted medieval game art, strong clear silhouette, simplified to read at 40 pixels wide, matte stone and wood. Center object with ample genuine transparent padding, no background, no checkerboard painting, no floor or cast shadow, no watermark, no letters.
```
