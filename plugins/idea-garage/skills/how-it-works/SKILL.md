---
name: how-it-works
description: Create (or refresh) the "How I made it" web page of a game, explaining behind the scenes with screenshots, the real code and the tools used, in simple words with glossary tooltips. Only when the person is curious and asks. Use for "come hai fatto?", "come funziona dentro?", "how does it work?", "what's a library?".
argument-hint: "[project] [regenerate]"
---

# How it works: behind the scenes

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md`. Only when asked (or, at most once per project,
offered as a curiosity right after its first publication). "regenerate" mode = rebuild silently after
an improve/fix, without opening it.

## The page: `giochi/<slug>/come-e-fatto.html`

Start from `motore/modelli/progetto/come-e-fatto.html`. It loads `../../motore/pagine.css` and
`../../motore/come-funziona.js`, which handle tooltips and levels: never reimplement them.

**Level 1, the story (always visible)**
- Take 3-4 photos of key moments: `node motore/fotografa.mjs <slug> --momento inizio:1500 --momento salto:1500:ArrowUp ...`
  (photos go into `foto/`). Choose moments that match the card rules.
- For each photo: one or two short sentences: "Quando premi la freccia su, il drago salta perché…".
- Put clickable bubbles on the photo (`.pezzo-bottone` with `data-mostra="pezzo-<id>"` and a position)
  that open the matching code piece in level 2.

**Level 2, the pieces of the game** (`data-livello="2"`, opens on request)
- One `<details id="pezzo-<id>" class="riquadro">` per thing the person can see (the jump, the stars,
  winning, the rules box `REGOLE`).
- Code shown in `<pre class="codice" data-da-file="gioco.js">` must be copied **exactly** from the file
  (escape `<`, `>`, `&`). You may add explanation lines only as `<span class="commento">// ...</span>`.
  Keep each piece short (3-12 lines).
- Explain each piece in plain sentences around it. Always show `REGOLE`: "Questi sono i numeri del tuo
  gioco. Se cambi 520 in 800, il drago salta più in alto!"

**Level 3, the tools** (`data-livello="3"`)
- One small box per tool actually used (the engine, JavaScript, HTML, the browser, the test robot),
  each with one or two sentences, told like tools in a workshop.

**Difficult words**: wrap them as `<span class="parola" data-termine="libreria">libreria</span>`.
The key must exist in `motore/glossario.json` for the garage language: explanations come only from
there, never written in the page. Highlight a word the first time it appears in each level only.
If you need a word that's missing, use a simpler word instead, and mention to the grown-up (once)
that the plugin glossary could gain it.

Fill every `{{...}}` (texts in the garage language: `TESTO_COME_FATTO` "Come l'ho fatto"/"How I made it",
`TESTO_PEZZI` "I pezzi del gioco"/"The pieces of the game", `TESTO_ATTREZZI` "Gli attrezzi"/"The tools",
`INVITO_LIVELLO_2` "Voglio vedere il codice 🔍"/"Show me the code 🔍", `INVITO_LIVELLO_3`
"E gli attrezzi? 🧰"/"And the tools? 🧰").

## Check, then open

1. `node motore/controlla-come-fatto.mjs <slug>` must print ✅ (every code line exists in the game,
   every highlighted word is in the glossary). Fix the page until it does: the page must never lie.
2. The portal card now shows "Come l'ho fatto 🔧" by itself. Save ("Pagina come l'ho fatto").
3. Open `http://localhost:4321/giochi/<slug>/come-e-fatto.html` (not in regenerate mode) and say:
   "Ecco come è fatto <titolo>! Passa col mouse sulle parole colorate per scoprire cosa vogliono dire 🔍"
4. Next step: "Vuoi capire un altro pezzo?" · `/migliora`. For `adulto`, offer to explain any piece in more depth in chat.
