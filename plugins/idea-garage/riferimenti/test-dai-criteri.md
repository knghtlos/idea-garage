# Tests from the card

The person's words decide when the game is done, not Claude.

## The chain

1. **Card rule** (in `IL-MIO-GIOCO.md`, the person's words): "Prendi 10 stelle per vincere."
2. **Criterion** (in `spec.md`, observable): "C4: with 10 stars the 'you win' screen appears."
3. **Test** (in `test/criteri.spec.mjs`), title = `C4: ` + the criterion sentence, written in the
   garage language so it reads like the card.

Every card rule produces at least one criterion. Every criterion produces exactly one test.

## Order of work (red → green)

1. Write `spec.md` criteria and `test/criteri.spec.mjs` **before** writing game code.
2. Copy `modelli/test/base.spec.mjs` unchanged into `test/` (technical checks: opens without errors,
   canvas visible, game loop running).
3. Run the tests: the new criteria must fail (red). If a criterion passes before you wrote its code,
   the test is not testing anything: fix the test.
4. Build one piece at a time; each piece turns one test green.
5. Done only when **all** tests are green: base, criteria, playability.

## Writing good tests

- Use the helpers in `motore/test-aiuti.mjs`: `apri`, `stato`, `tieni`, `slugDa`.
- Test with **real keys** whenever the criterion is about controls (`tieni(page, 'ArrowRight', 600)`).
- Use `window.gioco.scorciatoie` only to reach a situation quickly (teleport to a star), never to
  fake the result itself (never "give 10 stars" to test winning: collect them).
- Use `expect.poll` for anything that happens over time. No fixed waits for results.
- Keep tests independent: each one opens the game fresh.

## Playability tests (the player bot)

At least:
- **G1**: a bot using only keys reaches the first goal (first star, first gem, first correct answer).
- **G2**: what's needed to win actually exists in the level (enough stars, a reachable exit).
Add more when the archetype allows (the exit is reachable, the timer leaves enough time,
enemies don't spawn on top of the hero). A game nobody can win is a failing game.

## When the game changes

- `/improve` adds criteria for new rules. When a rule really changes, update only the tests of the
  criteria that changed, and log it in the spec change log ("C5 replaced by C9: now the dragon flies").
- `/fix` adds a test that reproduces the problem (it must fail first), then fixes the code.
  That test stays forever.
- Tests are never deleted to make the suite pass. If a test is wrong, fix the test and say why in the
  change log.

## What tests cannot tell

Whether the game is fun. That's the person's job with `/prova-il-gioco`.
