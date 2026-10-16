---
name: publish
description: Optionally publish a finished game of the Idea Garage online, in a web portal on GitHub Pages (for a file to upload elsewhere, use export instead). For a child, this sends a request for the OK that the grown-up approves on GitHub; for an adult, it publishes after a confirmation. Use for "pubblica", "fallo vedere ai miei amici", "metti online", "publish", "share it".
argument-hint: "[project]"
---

# Publish

> `${CLAUDE_PLUGIN_ROOT}` is the Idea Garage plugin folder. If it is not expanded, use the "Plugin root" path from the session context. Commands below run from the garage folder.

Follow `${CLAUDE_PLUGIN_ROOT}/riferimenti/tono.md` and `salvataggi-e-sicurezza.md`.

Publishing is optional: games always stay playable on the computer. If the person only wants a file
(for itch.io, their own site, a school platform), use `idea-garage:export` instead.

## 1. Checks before asking anything

For the project (`$ARGUMENTS`, else `progetto_attivo`, else ask):
1. Tests all green (`npx playwright test giochi/<slug>`). If not → `idea-garage:fix`.
2. The person said they like this version and it is saved. If not saved → save it now ("Pronto per il mondo").
3. A cover exists: `node motore/fotografa.mjs <slug>` (creates `copertina.png`).
4. **Privacy check** of every text in the project (title, card, on-screen texts, `gioco.json`, assets):
   real full names, school, town, street, email, phone, real classmates/teachers.
   - `bambino`: if found, propose the portal nickname or an invented name, change it together, re-test.
   - `adulto`: point it out in one line and let them decide.

## 2. First time only: the portal on GitHub (needs the grown-up / the adult)

If `git remote get-url origin` fails, this garage has never been online. For `bambino`, say:
"Per far vedere il gioco al mondo mi serve un grande, solo questa volta! 🙋". Then, to the grown-up,
in plain adult language:
1. `gh auth status` must be logged in (if not: `gh auth login`, done by the grown-up).
2. Explain: the portal becomes a public website (free GitHub Pages works only with public repositories);
   drafts, tests and technical notes are never published, only approved projects; use a nickname as repo name.
3. Ask the repository name (suggest the portal slug). Then:
   `gh repo create <name> --public --source . --push`
   Enable Pages from Actions: `gh api -X POST repos/{owner}/<name>/pages -f build_type=workflow`
   (if it says it already exists, fine).
4. Recommend they turn on notifications for pull requests in the GitHub app, so they get the OK requests on their phone.

## 3a. Child garage (`bambino`): request for the OK

The published state comes from files (see `salvataggi-e-sicurezza.md`), so the request never conflicts
with work the child keeps doing meanwhile.

1. Pick a new branch name `pubblica/<slug>-<n>` (n = 1, 2… not existing yet: `git branch -a --list "pubblica/<slug>-*"`).
   `git switch -c pubblica/<slug>-<n>` (from the current main, which includes the approved save).
2. Create `giochi/<slug>/pubblicato.json`: `{ "data": "<ISO>", "titolo": "<titolo>" }` (if it already exists,
   this is an update of a published game: just update `data`). Commit "🌍 <titolo> vuole uscire nel mondo!".
3. `git push -u origin pubblica/<slug>-<n>`.
4. `gh pr create --base main --head pubblica/<slug>-<n> --title "🌍 <titolo> vuole uscire nel mondo!" --body "<body>"`
   The body (garage language, for the grown-up): one line of who and what; the card rules as a list;
   what the robot checked; "Se ti va bene, approva (Merge): in pochi minuti il gioco sarà nel portale.
   Se vuoi guardarlo prima insieme, chiudi la richiesta: il gioco resta salvato."
5. `git switch main`. Create the local marker `giochi/<slug>/richiesta.json`: `{ "ramo": "pubblica/<slug>-<n>", "data": "<ISO>" }`
   (git-ignored). The portal now shows "⏳ Aspetta il via libera".
6. Tell the child: "Ho mandato <titolo> al tuo grande per il via libera! 📨 Quando dice sì, comparirà nel tuo portale."
   Next step: `/nuovo-gioco` · `/come-funziona` (offer the how-it-works page once, as a curiosity).

**Never merge the request**: the guard blocks it, and it's the grown-up's decision.

Later (the greeting does this) read the branch from `richiesta.json` and run
`gh pr view <branch> --json state -q .state`:
- `MERGED` → `git pull --no-rebase origin main`, delete `richiesta.json` (`rm giochi/<slug>/richiesta.json`),
  celebrate with the link `https://<owner>.github.io/<repo>/` (from `gh repo view --json url`, owner and name).
- `CLOSED` → delete `richiesta.json`; tell the child kindly the grown-up wants to look at it together first.
- `OPEN` → still waiting; say nothing unless asked.

## 3b. Adult garage (`adulto`)

Show what will be published (title, cover, link) and ask "Pubblico?". On yes: create
`giochi/<slug>/pubblicato.json`, commit, `git push origin main`. The GitHub Action publishes in 1-2 minutes;
give the link `https://<owner>.github.io/<repo>/`.
