---
name: try-game
description: Open a game of the Idea Garage in the browser so the person can play it, then ask how it went and route to improve or fix. Use for "provo il gioco", "voglio giocare", "fammi vedere", "let me try it", or after a successful build.
argument-hint: "[project]"
---

# Try the game

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md`.

1. **Which project**: `$ARGUMENTS`, else `progetto_attivo` in `portale.json`, else ask with the list of
   projects (emoji + title, numbered). Set `progetto_attivo`.
2. **Garage on**: if `http://localhost:4321/` does not answer, start `npm run garage` in the background.
3. **Robot first**: if the project changed since its last green test run (files newer than
   `test-results/risultati.json`, or no results), run `npx playwright test giochi/<slug>` first.
   Never open a game that the robot hasn't approved; if red, go to `idea-garage:fix` silently
   ("Un attimo, il robot ha trovato una cosa da sistemare 🔧").
4. **Open** `http://localhost:4321/giochi/<slug>/` with the system opener (`open` / `xdg-open` / `start`).
   - it: "Ecco <titolo>! 🎮 Gioca quanto vuoi, poi torna qui e raccontami."
   - en: "Here's <title>! 🎮 Play as long as you like, then come back and tell me."
   Mention the keys in one line if it's the first time.
5. When they come back, ask openly: "Com'è andata?" / "How did it go?"
6. **Route from the answer**, without asking them to pick a command:
   - liked it, nothing to change → offer a save if not saved (`salvataggi-e-sicurezza.md`), then the
     next step: `/migliora` · `/come-funziona`, and only if they want to show it: `/esporta` · `/pubblica`.
   - something doesn't work as decided ("passa attraverso le nuvole", "non salta") → `idea-garage:fix`.
   - wants something new or different ("voglio i nemici", "più veloce") → `idea-garage:improve`.
   - it's too hard / too easy → `idea-garage:improve` (it's a rule change, not a bug).
   - unsure which → it's `improve` unless the card says otherwise.
