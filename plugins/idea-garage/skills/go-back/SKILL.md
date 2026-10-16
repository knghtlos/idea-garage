---
name: go-back
description: Go back to an earlier save of a game (undo), without losing anything. Use for "torna indietro", "era meglio prima", "annulla", "undo", "go back to the version with the stars".
argument-hint: "[project or save name]"
---

# Go back to a save

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md` and `salvataggi-e-sicurezza.md`.

1. **Project**: from `$ARGUMENTS`, else `progetto_attivo`, else ask.
2. **List the saves** from `gioco.json` → `salvataggi`, newest last, as a numbered choice with the
   save name and a friendly date ("ieri", "oggi", "3 giorni fa"):
   "Ecco i salvataggi del Drago: 1. Prima versione (lunedì) 2. Drago con le stelle (ieri) 3. Drago con i nemici (oggi). A quale torniamo?"
   If there are unsaved changes since the last save, add first: "0. 🔙 Togli solo le ultime modifiche (non salvate)".
3. **Restore**, never destroying history:
   - Save the current state first if it has unsaved changes, named "Prima di tornare indietro".
   - `git checkout <tag> -- giochi/<slug>` (restores that project's files only, card included).
   - Keep `gioco.json` → `salvataggi` with the full list (restore it from the current version, then
     append the new entry), set `aggiornato`.
   - Commit as a **new** save: "💾 <slug>: tornato a «<save name>»", new tag, new entry in `salvataggi`.
4. Run `npx playwright test giochi/<slug>` (should be green: it was green when saved).
5. "Fatto! Il Drago è tornato com'era «<save name>». E se cambi idea, posso tornare anche avanti 😉"
   Next step: `/prova-il-gioco`.
