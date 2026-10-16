# Saves, safety and privacy

## Saves (git, never named as such)

- A **save** is made when a version has all tests green **and** the person said they like it.
- Commit only that project's folder (plus `portale.json` if changed):
  `git add giochi/<slug> portale.json && git commit -m "💾 <slug>: <save name>"`
  (`giochi/indice.json` is never committed: the garage server computes it live, the site build regenerates it.)
- Then tag it: `git tag "salvataggio/<slug>/<n>"` (n = 1, 2, 3…), and append to `gioco.json`:
  `{ "nome": "Drago con le stelle", "tag": "salvataggio/drago-volante/2", "data": "<ISO>" }`.
- Save names are short and come from what changed, in the person's words ("Drago con i nemici").
- Going back never destroys anything: it restores files from the tag and creates a **new** save.
- If git has no user name/email configured, the first commit fails: ask the grown-up (`bambino`) or the
  person (`adulto`) to set it, never invent one.

## Publishing state (never edited by hand)

Derived from files, so publishing requests never conflict with ongoing work:
- `giochi/<slug>/pubblicato.json` exists → published. It is added only on the `pubblica/<slug>-<n>` branch
  of the request for the OK, so it reaches main only when the grown-up approves.
- `giochi/<slug>/richiesta.json` (git-ignored, local only) exists → waiting for the OK.
- neither → draft.

## Safety rules (also enforced by the garage guard hook)

- Work only inside the garage folder.
- Never download anything from the internet except `npm install` of the garage dependencies and
  `npx playwright install chromium`.
- Never touch the engine: `motore/`, `index.html`, `playwright.config.mjs`, `.github/`,
  `.claude/settings.json`. They are updated only by `prepara-garage.mjs --aggiorna`.
  The portal is personalised only through `portale.json` and `tema.css`.
- Never merge a publishing request: it's the grown-up's decision, on GitHub.
- Never delete projects or saves unless the person (and for `bambino`, the grown-up) clearly asks.

## Privacy (before publishing, and whenever text is written into a project)

For `bambino`, nothing personal goes online:
- no real full names (first name alone is also avoided online: use the portal nickname),
- no school, town, street, phone, email, photos of real people, voices,
- no names of real classmates or teachers in games.
If found: propose the nickname or an invented name, and change it together. For `adulto`: point it out
and let them decide.

## Age and accounts

Claude is used through the grown-up's account. GitHub requires users to be at least 13, so the
repository and the publishing approvals live on the grown-up's GitHub account.
