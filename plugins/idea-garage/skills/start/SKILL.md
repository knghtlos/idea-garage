---
name: start
description: Set up a new Idea Garage (the folder and web portal where someone's games live) with a grown-up, or update the engine of an existing garage. Use when the user runs it, or when another Idea Garage skill finds no garage in the current folder.
argument-hint: "[--aggiorna]"
---

# Set up the garage

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

The plugin root is `${CLAUDE_PLUGIN_ROOT}` (the SessionStart context also states it). Read
`${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md` first if you have not yet in this session.

## 0. Already a garage?

If the current folder (or a parent) has `portale.json` and `motore/`:
- with `--aggiorna`, or if the context says the engine is older than the plugin: explain in one line
  that this updates only the engine (the person's games, portal name, colours and saves are untouched),
  then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/prepara-garage.mjs" --cartella "<garage>" --aggiorna`,
  then `npm install`, then `git add -A && git commit -m "🔧 Motore aggiornato"`. Done.
- otherwise: say the garage is ready and hand over to `idea-garage:new-game` or `idea-garage:help-me`.

## 1. Language and who will use it

The language is the one the person writes in (Italian or English). Do not ask it.

Ask one question (plain, it's a real choice):
- it: "Chi userà il garage? 1. 🧒 Un bambino o una bambina (con un grande che dà una mano) 2. 🙋 Io, sono un adulto"
- en: "Who will use the garage? 1. 🧒 A child (with a grown-up helping) 2. 🙋 Me, I'm an adult"

If it is a child: "Prima di iniziare mi serve un grande per 2 minuti! 🙋" / "Before we start I need a
grown-up for 2 minutes! 🙋". Wait until they say the grown-up is there. From now until step 4 you are
talking to the grown-up: normal, clear adult language.

## 2. Where (grown-up or adult)

Explain in 2-3 short lines what will happen: a folder "garage" with the games and a small web portal;
safety rules so the child never sees technical permission prompts; nothing goes online without the
grown-up's approval on GitHub.

The garage is the current folder if it is empty (or nearly), otherwise propose a new subfolder named
after the portal (step 3). Ask for confirmation of the folder.

Check what's needed, and report in one line each only if missing:
- Node.js ≥ 18 (`node -v`). If missing: point to https://nodejs.org and stop.
- git (`git --version`) and its identity (`git config user.name`). If missing identity, ask the grown-up
  to set it (`git config --global user.name "..."` / `user.email`), never invent one.
- GitHub CLI `gh` is only needed later for publishing; just mention it if missing.

## 3. Three fun questions (to the child, or the adult)

For a child, say: "Ok grande, grazie! Ora tocca a te 🧒" and from now on use the child tone.
Ask one at a time:
1. Portal name: "Come si chiama il tuo garage? Per esempio *Il Garage di Leo* o *La Fabbrica dei Draghi*"
   (suggest using a nickname, not the full real name).
2. Favourite colour: choice of 4 with emoji (🟣 viola `#6c5ce7`, 🔵 blu `#0984e3`, 🟢 verde `#00b894`,
   🔴 rosso `#e84393`) + "un altro colore".
3. Mascot: choice of 4 emoji (🐉 🤖 🦊 🚀) + "un'altra".

## 4. Build it

Run (this needs the grown-up's approval of the command, which is fine: they are there):

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/prepara-garage.mjs" --cartella "<folder>" --lingua <it|en> \
  --profilo <bambino|adulto> --nome "<name>" --colore "<hex>" --mascotte "<emoji>"
```

Then, inside the garage: `npm install` and `npx playwright install chromium` (downloads the test
robot's browser; tell them it takes a minute ☕). If the browser download fails, say the test robot
will not work until it's installed and continue.

Tell the grown-up, in 3 lines: settings are in `.claude/settings.json`; the child can now type `/nuovo-gioco`
(or just "ciao" in a new session); for publishing they'll need a GitHub account (theirs; GitHub requires 13+).
Important: the permissions only apply when Claude is started **inside the garage folder**, and only
after the folder is trusted: the first time Claude opens there, the grown-up must accept the
"trust this folder" question. Until then the child would still see permission prompts. If you are not
already in the garage folder, tell them to reopen Claude there and accept the trust question.

## 5. Show the portal

Start the garage server in the background: `npm run garage` (it prints `http://localhost:4321/`), then open
that URL with the system opener (`open` on macOS, `xdg-open` on Linux, `start` on Windows).
Say: "Ecco il tuo garage! 🎉 Qui arriveranno i tuoi giochi." / "Here's your garage! 🎉 Your games will show up here."

Then continue straight into `idea-garage:new-game` if the person came here to make a game; otherwise
offer the next step (`/nuovo-gioco` · `/aiuto`).
