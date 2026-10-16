// Attrezzi condivisi del robot collaudatore. Motore: non modificare a mano.
import { expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Dal percorso del file di test ricava il nome del progetto (giochi/<slug>/test/x.spec.mjs)
export function slugDa(metaUrl) {
  return path.basename(path.dirname(path.dirname(fileURLToPath(metaUrl))));
}

// Apre il progetto, raccoglie gli errori e aspetta che il gioco dica "pronto".
export async function apri(page, slug, { aspettaPronto = true } = {}) {
  const errori = [];
  page.on('pageerror', (e) => errori.push('errore nella pagina: ' + e.message));
  page.on('console', (m) => {
    // "Failed to load resource" lo controlla già requestfailed qui sotto, con l'indirizzo preciso
    if (m.type() === 'error' && !/Failed to load resource|favicon/i.test(m.text())) {
      errori.push('errore in console: ' + m.text());
    }
  });
  page.on('requestfailed', (r) => {
    const url = r.url();
    // I caratteri di Google Fonts sono un abbellimento: se internet manca, il gioco va lo stesso
    if (!/fonts\.(googleapis|gstatic)\.com/.test(url)) errori.push('file non trovato: ' + url);
  });
  await page.goto(`/giochi/${slug}/`);
  if (aspettaPronto) {
    await expect.poll(() => page.evaluate(() => Boolean(window.gioco && window.gioco.pronto)), {
      message: 'il gioco non è diventato pronto',
      timeout: 15000
    }).toBe(true);
  }
  return errori;
}

export const stato = (page) => page.evaluate(() => window.gioco.stato());

// Tiene premuto un tasto per un po' (millisecondi), come farebbe un bambino.
export async function tieni(page, tasto, ms) {
  await page.keyboard.down(tasto);
  await page.waitForTimeout(ms);
  await page.keyboard.up(tasto);
}

// Fotogrammi minimi al secondo. Su un computer normale 20 è facile;
// in ambienti senza scheda grafica si può abbassare con IDEA_GARAGE_FPS_MINIMI.
export const FPS_MINIMI = Number(process.env.IDEA_GARAGE_FPS_MINIMI || 20);
