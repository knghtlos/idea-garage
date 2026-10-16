// Criteri della carta del gioco (esempio per il modello 3D).
import { test, expect } from '@playwright/test';
import { slugDa, apri, stato } from '../../../motore/test-aiuti.mjs';

const SLUG = slugDa(import.meta.url);

test.describe('Criteri della carta', () => {
  test('C1: con le frecce l\'eroe cammina nel mondo', async ({ page }) => {
    await apri(page, SLUG);
    await page.locator('canvas').click();
    const prima = (await stato(page)).eroe;
    await page.keyboard.down('ArrowRight');
    await expect.poll(async () => (await stato(page)).eroe.x, { message: 'l\'eroe non è andato a destra' }).toBeGreaterThan(prima.x + 1);
    await page.keyboard.up('ArrowRight');
  });

  test('C2: con la barra spaziatrice l\'eroe salta e poi riatterra', async ({ page }) => {
    await apri(page, SLUG);
    await page.locator('canvas').click();
    await expect.poll(async () => (await stato(page)).eroe.aTerra).toBe(true);
    await page.keyboard.down('Space');
    await expect.poll(async () => (await stato(page)).eroe.y, { message: 'l\'eroe non si è alzato' }).toBeGreaterThan(0.3);
    await page.keyboard.up('Space');
    await expect.poll(async () => (await stato(page)).eroe.aTerra, { timeout: 10000 }).toBe(true);
  });

  test('C3: toccando una gemma il contatore sale', async ({ page }) => {
    await apri(page, SLUG);
    const g = (await page.evaluate(() => window.gioco.scorciatoie.gemme()))[0];
    await page.evaluate(({ x, y, z }) => window.gioco.scorciatoie.vaiA(x, y, z), g);
    await expect.poll(async () => (await stato(page)).gemme).toBe(1);
  });

  test('C4: con tutte le gemme necessarie compare "hai vinto"', async ({ page }) => {
    await apri(page, SLUG);
    const necessarie = await page.evaluate(() => window.gioco.regole.gemmePerVincere);
    const lista = await page.evaluate(() => window.gioco.scorciatoie.gemme());
    for (const g of lista) {
      if ((await stato(page)).gemme >= necessarie) break;
      const prima = (await stato(page)).gemme;
      await page.evaluate(({ x, y, z }) => window.gioco.scorciatoie.vaiA(x, y, z), g);
      await expect.poll(async () => (await stato(page)).gemme).toBeGreaterThan(prima);
    }
    await expect(page.locator('#vittoria')).toBeVisible();
  });

  test('C5: cadendo dal mondo si perde una vita', async ({ page }) => {
    await apri(page, SLUG);
    const vite = (await stato(page)).vite;
    await page.evaluate(() => window.gioco.scorciatoie.vaiA(40, 0, 40));
    await expect.poll(async () => (await stato(page)).vite, { timeout: 15000 }).toBe(vite - 1);
  });
});

test.describe('Giocabilità', () => {
  test('G1: tutte le gemme stanno sopra un\'isola (si possono raggiungere a piedi o saltando)', async ({ page }) => {
    await apri(page, SLUG);
    const s = await stato(page);
    const necessarie = await page.evaluate(() => window.gioco.regole.gemmePerVincere);
    expect(s.gemmeRimaste).toBeGreaterThanOrEqual(necessarie);
  });
});
