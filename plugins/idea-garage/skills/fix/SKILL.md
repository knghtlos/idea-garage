---
name: fix
description: Fix something in a game that does not work the way the game card says (falls through the floor, can't jump, the win screen never appears). The card does not change. Use for "non funziona", "il drago passa attraverso le nuvole", "it's broken", "the stars don't count".
argument-hint: "[what is wrong]"
---

# Fix: the card stays the same

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md` and `test-dai-criteri.md`.

1. **Project**: `$ARGUMENTS`'s project, else `progetto_attivo`, else ask with the list.
2. **Understand** (max 2 questions, plain, one at a time):
   "Cosa è successo?" then, if needed, "Quando succede? Subito, o dopo un po'?"
   Never say "bug" to a child: "Ok, il gioco ha fatto i capricci. Ci penso io 🔧".
3. **Is it really a fix?** Compare with the card (`IL-MIO-GIOCO.md`):
   - The card says otherwise → it is a fix, continue.
   - The game does exactly what the card says, but they want it different ("è troppo lento" and the
     speed was their choice) → switch to `idea-garage:improve` with no blame: "Ah, vuoi cambiarlo! Facciamo così…"
   - Claude misunderstood the card when writing the spec → fix `spec.md` (not the card: they were right)
     and its tests, then continue.
4. **Reproduce with a test**: launch `idea-garage:costruttore` with task
   "fix: <problem in plain words>". It must first add a test named `F<n>: <the problem, said as the
   correct behaviour>` (e.g. "F1: il drago si ferma sopra le nuvole") and see it **fail**. If it passes,
   the problem isn't understood yet: ask the person one more question and retry.
5. **Fix** until the new test is green and every other test is still green
   (`idea-garage:collaudatore` checks, max 3 rounds). The new test stays forever.
6. **Save** ("Drago sistemato"), log in the spec change log, then `idea-garage:try-game`:
   "Ho sistemato! Prova di nuovo 🎮".
7. Two failed rounds on the same problem → `idea-garage:help-me`, "call a grown-up" part.
