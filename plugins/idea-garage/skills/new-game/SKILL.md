---
name: new-game
description: Start a new game (or small app) in Idea Garage from a short description, through fun one-at-a-time questions, a game card the person approves, then automatic building and testing. Use when someone wants to make a new game or has a new idea, e.g. "voglio fare un gioco", "un drago che salta", "let's make a game".
argument-hint: "[the idea in a few words]"
---

# New game: from the idea to the approved card

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Read first (once per session): `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md`, then
`archetipi.md`, `detective.md` and `personaggi-famosi.md` in the same folder.
Target: from the idea to the approved card in about 5 minutes.

## 0. Garage check

If there is no garage (no `portale.json` + `motore/` here or above), run `idea-garage:start` first,
then come back here. If another project is a draft with unfinished questions ("where we were"),
ask first: "Finiamo prima il <titolo>, o iniziamo una cosa nuova?"

## 1. "Raccontami il tuo gioco" / "Tell me about your game"

If `$ARGUMENTS` already has the idea, use it. Otherwise ask exactly one open question:
- it: "Raccontami il tuo gioco! Anche solo una frase 🎮"
- en: "Tell me about your game! Even just one sentence 🎮"

Repeat back what you understood in **one** line, with their words.

## 2. The detective

1. Silently pick the archetype (`archetipi.md`). Don't name it.
2. Ask only the missing topics from `detective.md`, one per message, max 6-8, with the choice format
   and fading explanations from `tono.md` (check and update `esperienza.domande_viste` in `portale.json`).
3. Handle famous characters with `personaggi-famosi.md`, huge ideas and violence with `detective.md`.
4. Ask the game name last (offer 3 suggestions built from their answers + "un nome mio").

Keep notes as you go; nothing is written to the project until step 3.

## 3. Create the project and the card

1. Choose a short slug from the name (`drago-delle-nuvole`), then run in the garage:
   `node motore/nuovo-progetto.mjs --slug <slug> --modello <salta-e-corri|esplora-3d|vuoto> --titolo "<name>" --emoji "<emoji>" --descrizione "<their sentence>" --archetipo <archetype>`
   (`vuoto` = plain HTML for quiz, clicker and apps). If it says `npm install` is missing, run it and retry.
2. **Draw the hero now**: `giochi/<slug>/assets/eroe.svg`, exactly as they described it (colours,
   features, accessories). This is the final hero the game will use; for 3D it is a front view of
   the same hero. Make it charming: big readable shapes, eyes with personality, flat colours.
3. Fill `IL-MIO-GIOCO.md` (their words: who, goal, rules as short sentences, keys, ideas for later).
4. Fill `carta.html` from the template placeholders: title, their sentence, 4-6 rules each with an emoji,
   the keys (`<kbd>`), colour from `portale.json`, texts in the garage language
   (`TESTO_PORTALE`: "Il mio garage"/"My garage", `TESTO_REGOLE`: "Le regole"/"The rules",
   `TESTO_TASTI_TITOLO`: "I tasti"/"The keys"). No `{{...}}` may remain.
5. Make sure the garage server is running (`npm run garage` in the background if
   `http://localhost:4321/` doesn't answer) and open `http://localhost:4321/giochi/<slug>/carta.html`.
6. Ask simply: "Ti piace?" / "Do you like it?" (no numbered options).

## 4. Changes to the card

- If they want changes ("lo voglio rosso", "togli il tempo"): change the card (and `eroe.svg`), reload,
  ask "Ti piace?" again. Changes here are cheap: encourage them.
- When they say yes: "Fantastico! Comincio a costruire <titolo>. Ci metto qualche minuto ☕"

## 5. Hand over to building (automatic)

1. Write `spec.md` from the card: one acceptance criterion per rule (`test-dai-criteri.md`), plus G1/G2.
2. Update `gioco.json` (`aggiornato`). The portal list updates by itself (the garage server computes it).
3. Launch the `idea-garage:costruttore` agent with: the garage path, the slug, and "build from the card".
   Relay to the person only its 4-6 short progress lines if they arrive, otherwise wait.
4. Then launch the `idea-garage:collaudatore` agent (it did not write the code, so it doesn't grade its own work).
   - If it reports failures, send its report to `idea-garage:costruttore` to fix, then test again.
     Max 3 rounds. After the third, the builder simplifies the hard piece and says what it postponed
     ("Le nuvole che si muovono erano complicate: per ora stanno ferme, le facciamo muovere con /migliora"),
     adding it to "idee per dopo". If still red: `idea-garage:help-me` "call a grown-up".
5. All green: make the first save (`salvataggi-e-sicurezza.md`), named e.g. "Prima versione".
   Increase `esperienza.progetti_completati` in `portale.json` on the first save of each project.
6. Say: "✅ Il robot ha provato <titolo> e funziona tutto! Ora tocca a te 🎮" and run `idea-garage:try-game`.
