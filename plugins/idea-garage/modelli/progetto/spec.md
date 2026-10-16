# Spec: {{TITOLO}}

<!-- Per Claude. La carta (IL-MIO-GIOCO.md) è la verità del bambino; questa è la sua traduzione tecnica.
     Se carta e spec non coincidono, ha ragione la carta: si corregge la spec. -->

- Archetype: {{ARCHETIPO}}
- Tool: {{ATTREZZO}} (library copied into `libs/`)
- Starting template: `modelli/giochi/{{MODELLO}}`
- Language of all on-screen text: {{LINGUA}}

## Acceptance criteria

<!-- One criterion per rule of the card. Each one becomes ONE Playwright test in test/criteri.spec.mjs,
     whose title is "C<n>: <the sentence below>". Never delete a criterion silently:
     when /improve changes a rule, mark the old one as replaced and say which new one replaces it. -->

| ID | Criterion (observable, in plain words) | From the card rule | Test |
|----|----------------------------------------|--------------------|------|
| C1 | Pressing → moves the hero right | "Usa le frecce per muoverti" | criteri.spec.mjs |

## Playability

| ID | Check |
|----|-------|
| G1 | The player bot, using only the keys, reaches at least the first goal |
| G2 | The things needed to win really exist in the level |

## Test hooks (`window.gioco`)

- `pronto`, `regole`, `stato()` → { ...fields the tests read... , fotogrammi }
- `scorciatoie` → { ...shortcuts only the tests use... }

## Change log

<!-- One line per /improve or /fix: date, what changed, which criteria were added/replaced. -->
