---
name: help-me
description: Show all Idea Garage commands grouped by what you want to do, suggest the best one for right now, greet the person at the start of a session, or call a grown-up with a note explaining the problem. Use for "aiuto", "cosa posso fare?", "non so cosa fare", "help", "chiama un grande", or automatically after two failed attempts.
argument-hint: "[grande]"
---

# Help, greeting and "call a grown-up"

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md`. Use the command names of the garage language
(the short ones without the `idea-garage:` prefix: the garage has them in `.claude/skills/`).

## Greeting (first message of a session)

Use the SessionStart context. In 3-4 lines:
1. Welcome with the mascot and the portal name: "🐉 Bentornato nel Garage di Leo!"
2. **News first**, if any:
   - a project `in-attesa`: follow the "Later" part of `idea-garage:publish` step 3a (skip quietly if
     `gh` or the network fails). If merged, celebrate: "🎉 Il tuo grande ha detto sì: <titolo> è nel tuo portale!"
   - a draft with "where we were": "L'ultima volta stavamo <dove eravamo>."
3. 2-3 numbered options: continue the active project · new game · play one of your games.
   First session ever (no projects): "Vuoi creare il tuo primo gioco? Raccontamelo! 🎮"

## The command list (`/aiuto`, `/help-me`)

At the top, one line with the best command for right now (e.g. after a build: "Adesso ti conviene /prova-il-gioco!").
Then, one short sentence each:

**it**
- 🎨 **Creo**: `/nuovo-gioco` un gioco nuovo · `/migliora` aggiungo o cambio qualcosa
- 🎮 **Provo**: `/prova-il-gioco` gioco a quello che ho fatto
- 🔧 **Sistemo**: `/aggiusta` qualcosa non va · `/torna-indietro` torno a un salvataggio
- 🔍 **Scopro**: `/come-funziona` come è fatto dietro le quinte
- 🌍 **Mostro a tutti**: `/pubblica` con il via libera del grande
- 🙋 **Mi serve aiuto**: scrivi "chiama un grande"

**en**
- 🎨 **Create**: `/new-game` a new game · `/improve` add or change something
- 🎮 **Try**: `/try-game` play what I made
- 🔧 **Fix**: `/fix` something's wrong · `/go-back` back to a save
- 🔍 **Discover**: `/how-it-works` behind the scenes
- 🌍 **Show everyone**: `/publish` with the grown-up's OK
- 🙋 **I need help**: type "call a grown-up"

End with: "Puoi anche scrivermi cosa vuoi fare con parole tue!" / "You can also just tell me in your own words!"
For `adulto`, drop the grown-up lines.

## Call a grown-up (`grande` argument, "chiama un grande", or two failed attempts in a row)

1. To the child: "Questo è un pezzo difficile! Ho preparato un biglietto per il tuo grande 📝 Chiamalo quando vuoi."
2. Write `AIUTO-PER-IL-GRANDE.md` in the garage root (overwrite), in clear adult language:
   date, project, what the child wanted, what happened, what Claude tried (each attempt in one line),
   where it is stuck, the failing test names and the key error lines, and 1-2 suggestions
   (e.g. "simplify the moving clouds", "install the test browser: npx playwright install chromium").
   This file is never published.
3. When the grown-up arrives and reads it, continue with them in normal adult language.
4. For `adulto`, skip the note: explain the problem directly in plain words and propose options.
