// Criteri della carta del gioco: UN test per ogni criterio di spec.md.
// Il titolo di ogni test è la frase del criterio, così si legge come la carta.
// Il costruttore li scrive PRIMA del codice; all'inizio sono tutti rossi.
import { test, expect } from '@playwright/test';
import { slugDa, apri, stato } from '../../../motore/test-aiuti.mjs';

const SLUG = slugDa(import.meta.url);

test.describe('Criteri della carta', () => {
  test('C1: premendo la freccia a destra l\'eroe va a destra', async ({ page }) => {
    await apri(page, SLUG);
    await page.waitForTimeout(500);
    const prima = (await stato(page)).eroe.x;
    await page.keyboard.down('ArrowRight');
    await expect.poll(async () => (await stato(page)).eroe.x, { message: 'l\'eroe non è andato a destra' }).toBeGreaterThan(prima + 40);
    await page.keyboard.up('ArrowRight');
  });

  test('C2: premendo la freccia su l\'eroe salta e poi riscende', async ({ page }) => {
    await apri(page, SLUG);
    await expect.poll(async () => (await stato(page)).eroe.aTerra).toBe(true);
    const terra = (await stato(page)).eroe.y;
    await page.keyboard.down('ArrowUp');
    await expect.poll(async () => (await stato(page)).eroe.y, { message: 'il drago non si è alzato' }).toBeLessThan(terra - 30);
    await page.keyboard.up('ArrowUp');
    await expect.poll(async () => (await stato(page)).eroe.aTerra, { timeout: 10000 }).toBe(true);
  });

  test('C3: toccando una stella il contatore sale di uno', async ({ page }) => {
    await apri(page, SLUG);
    const stella = (await page.evaluate(() => window.gioco.scorciatoie.stelle()))[0];
    await page.evaluate(({ x, y }) => window.gioco.scorciatoie.vaiA(x, y), stella);
    await expect.poll(async () => (await stato(page)).stelle).toBeGreaterThanOrEqual(1);
    const prese = (await stato(page)).stelle;
    await expect(page.locator('#punteggio')).toContainText('⭐ ' + prese);
  });

  test('C4: con tutte le stelle necessarie compare "hai vinto"', async ({ page }) => {
    await apri(page, SLUG);
    const necessarie = await page.evaluate(() => window.gioco.regole.stellePerVincere);
    const stelle = await page.evaluate(() => window.gioco.scorciatoie.stelle());
    for (const s of stelle) {
      if ((await stato(page)).stelle >= necessarie) break;
      const prima = (await stato(page)).stelle;
      await page.evaluate(({ x, y }) => window.gioco.scorciatoie.vaiA(x, y), s);
      await expect.poll(async () => (await stato(page)).stelle).toBeGreaterThan(prima);
    }
    await expect(page.locator('#vittoria')).toBeVisible();
    expect((await stato(page)).finito).toBe('vinto');
  });

  test('C5: cadendo giù si perde una vita e si riparte', async ({ page }) => {
    await apri(page, SLUG);
    const vite = (await stato(page)).vite;
    await page.evaluate(() => window.gioco.scorciatoie.vaiA(480, 700));
    await expect.poll(async () => (await stato(page)).vite).toBe(vite - 1);
    expect((await stato(page)).eroe.y).toBeLessThan(540);
  });
});

test.describe('Giocabilità', () => {
  test('G1: il bot giocatore, usando solo i tasti, riesce a prendere almeno una stella', async ({ page }) => {
    await apri(page, SLUG);
    await page.keyboard.down('ArrowRight');
    for (let i = 0; i < 12 && (await stato(page)).stelle === 0; i++) {
      await page.keyboard.down('ArrowUp');
      await page.waitForTimeout(150);
      await page.keyboard.up('ArrowUp');
      await page.waitForTimeout(450);
    }
    await page.keyboard.up('ArrowRight');
    expect((await stato(page)).stelle).toBeGreaterThan(0);
  });

  test('G2: le stelle per vincere esistono davvero nel livello', async ({ page }) => {
    await apri(page, SLUG);
    const s = await stato(page);
    const necessarie = await page.evaluate(() => window.gioco.regole.stellePerVincere);
    expect(s.stelleRimaste).toBeGreaterThanOrEqual(necessarie);
  });
});
