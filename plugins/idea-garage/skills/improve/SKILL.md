---
name: improve
description: Add something new to a game or change how it works or looks (new enemies, faster, red hero, a second level), or personalise the garage portal. The game card changes. Use for "voglio i nemici", "più veloce", "mettiamo le monete", "make it harder", "change the portal background".
argument-hint: "[what to add or change]"
---

# Improve: the card changes

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md`, `detective.md` and `test-dai-criteri.md`.

## 0. Target

- If the request is about the **portal** ("il portale", "la mia pagina", "lo sfondo del garage"):
  change **only** `portale.json` (name, colour, mascot) and `tema.css` (anything visual: background,
  fonts, decorations via CSS). Never touch `index.html` or `motore/` (the guard blocks it anyway).
  Reload `http://localhost:4321/`, ask "Ti piace?", commit `🎨 Portale: <cosa>`. Done.
- Otherwise the project is `$ARGUMENTS`'s project, else `progetto_attivo`, else ask with the list.
- If the request is really something not working as the card says, switch to `idea-garage:fix`
  without saying they chose wrong.

## 1. How big is it?

| Size | Examples | What to do |
|---|---|---|
| Small | colour, speed, number of stars, name, a sound | no questions: change it |
| Medium | enemies, coins, a power-up, a timer, a new kind of obstacle | 1-2 detective questions |
| Big | 10 levels, two players, online, a whole new world | split: "Facciamo prima il livello 2, poi gli altri" and park the rest in "idee per dopo" |

## 2. Check conflicts with the card

If the change contradicts an existing rule, ask one plain question:
"Prima si perdeva cadendo. Se il drago vola, cadere non serve più: tolgo questa regola?"

## 3. Update the card (medium and big)

Update `IL-MIO-GIOCO.md`, `carta.html` and, if the look changes, `assets/eroe.svg`.
Open the card, show what's new (one line), ask "Ti piace?". Small changes skip this step but the card
files are still updated.

## 4. Spec and tests

- New rules → new criteria (next free number) and new tests, written before the code (red first).
- Changed rules → update only those criteria/tests, and log it in the spec change log
  ("C5 replaced by C9: now the dragon flies").
- Every other test stays exactly as it is and must keep passing: that's what protects what already worked.

## 5. Build, test, save

Same loop as in `new-game` step 5: `idea-garage:costruttore` (task: "improve: <change>"), then
`idea-garage:collaudatore`, max 3 rounds. Regenerate `come-e-fatto.html` if it exists (via
`idea-garage:how-it-works`, regenerate mode) and re-run `node motore/controlla-come-fatto.mjs <slug>`.
On green: save named after the change ("Drago con i nemici"), update `aggiornato` in `gioco.json`,
then `idea-garage:try-game`.
