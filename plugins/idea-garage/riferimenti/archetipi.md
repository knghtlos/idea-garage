# Archetypes and tools

Before asking the detective questions, recognise the archetype from the first description.
The archetype decides which questions to ask (see `detective.md`) and which template to start from.
Never name the archetype to the person; it is internal.

| Archetype | Sounds like | Tool | Template |
|---|---|---|---|
| `salta-e-corri` (platformer) | "salta sulle nuvole", "corre e salta sui nemici", "tipo Mario" | Phaser | `modelli/giochi/salta-e-corri` |
| `raccogli-ed-evita` | "prendo le mele e scappo dalle api" | Phaser | start from `salta-e-corri`, top-down: gravity 0, move in 4 directions |
| `labirinto` | "un topo che cerca il formaggio" | Phaser | start from `salta-e-corri`, gravity 0, walls as a grid |
| `navicella` (shooter) | "un razzo che spara alle meteore" | Phaser | start from `salta-e-corri`, gravity 0, hero at the bottom, falling enemies |
| `quiz` | "domande sugli animali" | HTML | plain page, no library |
| `clicca-e-cresci` (clicker) | "clicco e il negozio diventa grande" | HTML (or Phaser if animated) | plain page |
| `corsa` (runner) | "corro e salto gli ostacoli" | Phaser | `salta-e-corri` with auto-scrolling |
| `esplora-3d` | "un mondo dove posso girare", "tipo Minecraft", "in 3D" | Babylon.js | `modelli/giochi/esplora-3d` |
| `vola-3d` / `corsa-3d` | "un aereo che vola tra le montagne", "macchine in 3D" | Babylon.js | start from `esplora-3d` |
| `app` (experimental) | adults: "un quiz per la classe", "un calcolatore", "una pagina per..." | HTML | plain page |

If nothing fits, choose the closest and adapt. If the person wants 2D vs 3D and it's unclear,
the detective asks: "Il tuo mondo è piatto come un cartone animato, o puoi girarci intorno come in Minecraft?"

## Tools

- **Phaser 3** for 2D: mature, very well documented, arcade physics included.
  Copy `node_modules/phaser/dist/phaser.min.js` into `giochi/<slug>/libs/`.
- **Babylon.js** for 3D: a full 3D engine in the browser (lights, shadows, collisions, sound).
  Copy `node_modules/babylonjs/babylon.js` into `giochi/<slug>/libs/`.
- **Plain HTML, CSS, JavaScript** for quiz, clicker and apps: no library.

Every project is an **island**: its own copy of the library in `libs/`, no code shared with other
projects, no imports from other folders except the shared test helpers in `motore/`.
This way a library update or a new project can never break an old one.

Never load libraries from a CDN in a game: the game must work offline and forever.

## Graphics and sound

- Draw everything with code: SVG files in `assets/` (hero, enemies, objects) or textures generated
  in code (Phaser `graphics.generateTexture`), Babylon meshes built from primitives (low-poly style).
- The hero is always `assets/eroe.svg` (2D) and is the same file shown on the card. For 3D, the card
  shows `assets/eroe.svg` as a front view drawing of the same hero (same colours and features).
- Sounds are synthesised with WebAudio (see the `suono()` function in the templates). No audio files.
- Good-looking but simple: flat colours, rounded shapes, strong contrast, big readable text.
- Be honest about 3D: Claude builds great low-poly worlds; realistic characters would need
  models made by artists. Say it kindly if asked ("facciamo uno stile tipo cartone, a blocchetti").

## Rules every game follows (they make testing possible)

1. All numbers the person may want to change live at the top in `REGOLE`, with plain names.
2. The game exposes `window.gioco = { pronto, regole, stato(), scorciatoie }`:
   - `pronto`: true when the first frame is ready.
   - `stato()`: everything the tests need to read, always including `fotogrammi` (frames drawn).
   - `scorciatoie`: shortcuts for tests only (teleport, list of objects, restart). Never used by the game.
3. Win and lose screens are DOM elements `#vittoria` and `#sconfitta` (hidden until needed).
4. A 🏠 link back to the portal (`../../`).
5. All on-screen text in the garage language.
6. Keyboard first (arrows + space). Add touch buttons only if the person asks for tablet play.
