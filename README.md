# 🚗 Idea Garage

*[English version below](#english)*

**Idea Garage** è un plugin per [Claude Code](https://code.claude.com) che permette a un bambino di 8 anni,
anche da solo, di creare i suoi videogiochi raccontandoli. Funziona anche per qualsiasi adulto che non ha mai
programmato.

Il bambino racconta l'idea, risponde a qualche domanda divertente, approva la **carta del gioco** e Claude
costruisce il gioco, lo fa provare a un **robot collaudatore** e lo apre nel browser. Ogni gioco si ritrova in
**il mio garage**, una pagina sul computer con tutte le sue creazioni.

Il plugin serve a **creare in fretta giochi e piccole app che funzionano**. Dove vanno poi è una scelta:
possono restare sul computer, diventare un pacchetto zip da caricare dove si vuole, oppure andare su internet.
Niente di tutto questo è obbligatorio.

## Come funziona

```
/nuovo-gioco → domande del detective → carta del gioco ("Ti piace?")
   → costruzione (automatica) → robot collaudatore → /prova-il-gioco
   → /migliora (la carta cambia) · /aggiusta (la carta resta) · /torna-indietro
   → se vuoi mostrarlo: /esporta (un pacchetto zip) oppure /pubblica (un link su internet)
```

| Comando | Cosa fa |
|---|---|
| `/nuovo-gioco` | Un gioco nuovo: racconto, domande, carta del gioco, costruzione |
| `/prova-il-gioco` | Apre il gioco nel browser e chiede com'è andata |
| `/migliora` | Aggiunge o cambia qualcosa (anche il portale) |
| `/aggiusta` | Sistema quello che non va come avevamo deciso |
| `/torna-indietro` | Torna a un salvataggio, senza perdere niente |
| `/come-funziona` | Pagina "Come l'ho fatto": foto, codice vero e parole difficili spiegate |
| `/esporta` | Facoltativo: crea uno zip autonomo da caricare su itch.io, su un sito o sulla piattaforma della scuola |
| `/pubblica` | Facoltativo: mette il gioco su internet, in un portale su GitHub Pages, con il via libera del grande |
| `/aiuto` | Tutti i comandi, oppure "chiama un grande" |

Non serve ricordarli: basta scrivere "ciao" e Claude propone da dove ripartire, oppure dire con parole proprie
cosa si vuole fare.

## I principi

- **Le parole del bambino decidono quando il gioco è finito.** Ogni regola della carta diventa un test automatico;
  il gioco è pronto solo quando sono tutti verdi, e i vecchi test proteggono quello che già funzionava.
- **Ogni gioco è un'isola**, con la sua copia della libreria. Un gioco nuovo non può rompere quelli vecchi.
- **Il motore del portale e le scelte del bambino sono separati.** Il plugin aggiorna il motore;
  le personalizzazioni vivono in `portale.json` e `tema.css` e non si perdono mai.
- **Sicurezza**: una guardia blocca tutto quello che non deve succedere (lavorare fuori dal garage, toccare il motore,
  scaricare cose, cancellare progetti, approvare pubblicazioni). Esportare e pubblicare si fanno sempre con l'adulto,
  dopo un controllo privacy.
- **Personaggi famosi**: il gioco "tipo Mario" si può fare tutto, con le stesse meccaniche; l'eroe è inventato dal bambino.

## La vetrina

La cartella `sito/` è una vetrina pubblica del progetto (pubblicata dal ramo `gh-pages`), su **https://knghtlos.github.io/idea-garage/**: racconta
come nasce un gioco e raccoglie i giochi creati, giocabili nel browser. Per aggiungerne uno, esportalo con
`/esporta` e poi `node sito/aggiungi-gioco.mjs <zip> --autore "Leo, 8 anni"` (sempre un nickname).

## Attrezzi

- **Phaser** per i giochi 2D, **Babylon.js** per i mondi 3D, HTML semplice per quiz e piccole app.
- **Playwright** per il robot collaudatore.
- Facoltativo: **GitHub Pages** per un portale pubblico. Escono solo i giochi approvati, mai bozze, test o note tecniche.

## Installazione (per l'adulto)

Servono [Claude Code](https://code.claude.com), [Node.js](https://nodejs.org) 18 o superiore e git.
Solo se un giorno si vuole pubblicare su internet serve anche la [GitHub CLI](https://cli.github.com) con un
account GitHub dell'adulto.

```
/plugin marketplace add knghtlos/idea-garage
/plugin install idea-garage@idea-garage
```

Poi, in una cartella vuota: `/idea-garage:start`. Il setup chiede chi userà il garage (un bambino con un grande,
oppure un adulto), prepara cartella, portale, permessi e test, e fa tre domande divertenti al bambino (nome del
portale, colore, mascotte).

**Importante:** la prima volta che Claude si apre nella cartella del garage, l'adulto deve accettare la domanda
"ti fidi di questa cartella?". Solo dopo valgono i permessi che evitano al bambino le richieste di approvazione.

## Età e account

Claude si usa con l'account dell'adulto. Se si pubblica, GitHub richiede almeno 13 anni, quindi il repository e le
approvazioni vivono sull'account dell'adulto. Tutto quello che esce dal computer usa un nickname, mai nome e cognome.

## Struttura del repository

```
.claude-plugin/marketplace.json      il marketplace (questo repo)
plugins/idea-garage/
  .claude-plugin/plugin.json
  skills/        start, new-game, try-game, improve, fix, go-back, how-it-works, export, publish, help-me
  agents/        costruttore (builder), collaudatore (test robot)
  hooks/         contesto a inizio sessione, guardia del garage
  scripts/       prepara-garage, guardia, contesto
  motore/        il motore copiato in ogni garage: portale, server locale, test, glossario, pagine
  modelli/       modelli di gioco (2D, 3D), carta, pagina "come l'ho fatto", file del garage
  riferimenti/   tono, archetipi, domande del detective, personaggi famosi, test, salvataggi e sicurezza
```

Le istruzioni per Claude sono in inglese (neutre per tutte le lingue); tutto quello che vede il bambino è in
italiano o in inglese, a scelta.

## Sviluppo

```
claude plugin validate .
claude --plugin-dir ./plugins/idea-garage
```

Per provare i modelli senza scheda grafica: `IDEA_GARAGE_CHROMIUM=<chromium> IDEA_GARAGE_FPS_MINIMI=1 npx playwright test`.

Licenza: MIT.

---

<a name="english"></a>

# 🚗 Idea Garage (English)

**Idea Garage** is a [Claude Code](https://code.claude.com) plugin that lets an 8-year-old, even on their own,
create video games by telling them. It works just as well for any adult who has never programmed.

The child tells the idea, answers a few fun questions, approves the **game card**, and Claude builds the game,
has a **test robot** play it, and opens it in the browser. Every game shows up in **my garage**, a page on the
computer with all their creations. Games can stay there, become a zip to upload anywhere (`/export-game`), or go
online (`/publish`): all optional.

```
/new-game → detective questions → game card ("Do you like it?")
   → building (automatic) → test robot → /try-game
   → /improve (the card changes) · /fix (the card stays) · /go-back
   → to show it, if you want: /export-game (a zip) or /publish (a link on the internet)
```

Commands in English: `/new-game`, `/try-game`, `/improve`, `/fix`, `/go-back`, `/how-it-works`, `/export-game`,
`/publish`, `/help-me`. Or just say "hi" and Claude suggests where to pick up.

**Install** (grown-up): `/plugin marketplace add knghtlos/idea-garage`, `/plugin install idea-garage@idea-garage`,
then `/idea-garage:start` in an empty folder. The first time Claude opens in the garage folder, accept the
"trust this folder" question, so the child never sees permission prompts.

Principles: the child's words define "done" (every card rule becomes an automatic test); every game is an
island; the portal engine is separate from the child's choices; a guard blocks unsafe actions; nothing goes
online without the grown-up's approval on GitHub; famous-character games keep every mechanic but get an
original hero.

License: MIT.
