---
name: export
description: Package a finished game or app of the Idea Garage into a self-contained zip, ready to upload to itch.io, a school site or any website. No GitHub needed. Use for "esporta", "voglio il pacchetto", "lo metto sul mio sito", "export", "download my game", or when someone wants to share a game as a file.
argument-hint: "[project]"
---

# Export: a package to take anywhere

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md` and `salvataggi-e-sicurezza.md`.
Exporting is optional. Games always stay playable on the computer from "il mio garage" without exporting.

## 1. Checks

For the project (`$ARGUMENTS`, else `progetto_attivo`, else ask with the list):
1. Tests all green (`npx playwright test giochi/<slug>`). If not → `idea-garage:fix`.
2. The person likes this version and it is saved. If not saved → save it ("Pronto da esportare").
3. Cover: `node motore/fotografa.mjs <slug>` if `copertina.png` is missing or older than the game.
4. **Privacy check**, the same as for publishing: no real full names, school, town, address, email,
   phone, real classmates or teachers in any text of the project.
   - `bambino`: change them together (nickname or invented name), re-test.
   - `adulto`: point it out in one line and let them decide.
5. For `bambino`: a package can leave the computer, so the grown-up should know.
   "Prima di preparare il pacchetto, chiama il tuo grande così sa dove va il gioco 🙋". Continue when they say the grown-up is there.

## 2. Make the package

`node motore/esporta.mjs <slug>` → creates `esportati/<slug>-<date>.zip`.
The script copies the game with its library, drawings and pages, leaves out tests and technical notes,
fixes the paths so nothing depends on the garage, and refuses if something still points outside.
If it refuses, fix the project file it names (usually a link or path written by hand) and retry.

## 3. Tell them how to use it

To the child: "Ecco il pacchetto di <titolo>! 📦 Il tuo grande sa dove trovarlo." Then, to the grown-up
(or directly to the `adulto`), 3-4 plain lines:
- where the file is (`esportati/…zip`, full path),
- **itch.io**: create a project, kind "HTML", upload the zip, tick "This file will be played in the browser";
- **any website or school platform**: unzip and upload the folder; the game opens from `index.html`;
- it needs to be **served by a website**: opening `index.html` with a double click from the disk may
  not load the drawings, because browsers block that. To play it on the computer, use "il mio garage".

Next step: `/nuovo-gioco` · `/migliora` · `/come-funziona` (the package also contains the
"Come l'ho fatto" page, if it exists).
