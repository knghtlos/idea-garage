#!/usr/bin/env node
// Fa le foto di un progetto: la copertina per il portale e le foto per "Come l'ho fatto".
// Uso: node motore/fotografa.mjs <slug> [--momento nome:millisecondi:tasti] ...
//   --momento salto:1500:ArrowUp   -> aspetta 1,5 s, tiene premuto ArrowUp e scatta foto/salto.png
// La copertina è sempre giochi/<slug>/copertina.png (dopo 2,5 secondi di gioco).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argomenti = process.argv.slice(2);
const slug = argomenti[0];
if (!slug) { console.error('Dimmi quale progetto fotografare: node motore/fotografa.mjs <slug>'); process.exit(1); }
const radice = process.cwd();
const cartella = path.join(radice, 'giochi', slug);
if (!fs.existsSync(cartella)) { console.error('Non trovo giochi/' + slug); process.exit(1); }

const momenti = [];
for (let i = 1; i < argomenti.length; i++) {
  if (argomenti[i] === '--momento' && argomenti[i + 1]) {
    const [nome, ms, tasti] = argomenti[++i].split(':');
    momenti.push({ nome, ms: Number(ms) || 1500, tasti: tasti ? tasti.split('+') : [] });
  }
}

const porta = 4323;
const server = spawn(process.execPath, [path.join(radice, 'motore', 'server.mjs'), radice, String(porta)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));

const browserPersonale = process.env.IDEA_GARAGE_CHROMIUM;
const browser = await chromium.launch({
  executablePath: browserPersonale || undefined,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});
try {
  const pagina = await browser.newPage({ viewport: { width: 1200, height: 675 } });
  const url = `http://localhost:${porta}/giochi/${slug}/`;

  await pagina.goto(url);
  await pagina.waitForTimeout(2500);
  await pagina.screenshot({ path: path.join(cartella, 'copertina.png') });
  console.log('📸 copertina.png');

  if (momenti.length) fs.mkdirSync(path.join(cartella, 'foto'), { recursive: true });
  for (const m of momenti) {
    await pagina.goto(url);
    await pagina.locator('canvas').first().click({ trial: true }).catch(() => {});
    await pagina.waitForTimeout(m.ms);
    for (const t of m.tasti) await pagina.keyboard.down(t);
    await pagina.waitForTimeout(250);
    await pagina.screenshot({ path: path.join(cartella, 'foto', m.nome + '.png') });
    for (const t of m.tasti) await pagina.keyboard.up(t);
    console.log('📸 foto/' + m.nome + '.png');
  }
} finally {
  await browser.close();
  server.kill();
}
