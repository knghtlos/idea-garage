// Test di base: uguali per ogni progetto, arrivano dal modello. Non si cancellano.
import { test, expect } from '@playwright/test';
import { slugDa, apri, stato, FPS_MINIMI } from '../../../motore/test-aiuti.mjs';

const SLUG = slugDa(import.meta.url);

test.describe('Base: il gioco funziona', () => {
  test('si apre senza errori', async ({ page }) => {
    const errori = await apri(page, SLUG);
    await page.waitForTimeout(1500);
    expect(errori, errori.join('\n')).toEqual([]);
  });

  test('il disegno del gioco è sullo schermo', async ({ page }) => {
    await apri(page, SLUG);
    // Giochi: la tela (canvas). Quiz e app: l'elemento con data-gioco.
    await expect(page.locator('canvas, [data-gioco]').first()).toBeVisible();
  });

  test('il gioco si muove (non è bloccato)', async ({ page }) => {
    await apri(page, SLUG);
    const prima = (await stato(page)).fotogrammi;
    test.skip(prima === undefined, 'progetto senza animazione (quiz o app)');
    await page.waitForTimeout(1000);
    const dopo = (await stato(page)).fotogrammi;
    expect(dopo - prima, 'troppi pochi fotogrammi in un secondo: il gioco va a scatti').toBeGreaterThan(FPS_MINIMI);
  });
});
