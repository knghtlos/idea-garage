#!/usr/bin/env node
// Il robot collaudatore controlla la pagina "Come l'ho fatto":
//  1. ogni riga di codice mostrata esiste davvero nel file del gioco (la pagina non deve mentire);
//  2. ogni parola evidenziata ha la sua spiegazione nel glossario.
// Uso: node motore/controlla-come-fatto.mjs <slug>
import fs from 'node:fs';
import path from 'node:path';

const slug = process.argv[2];
const radice = process.cwd();
const cartella = path.join(radice, 'giochi', slug || '');
const pagina = path.join(cartella, 'come-e-fatto.html');
if (!slug || !fs.existsSync(pagina)) { console.error('Non trovo giochi/' + slug + '/come-e-fatto.html'); process.exit(1); }

// I commenti HTML (istruzioni ed esempi del modello) non contano
const html = fs.readFileSync(pagina, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const lingua = /<html[^>]*lang="en/i.test(html) ? 'en' : 'it';
const glossario = JSON.parse(fs.readFileSync(path.join(radice, 'motore', 'glossario.json'), 'utf8'))[lingua];
const problemi = [];

const decodifica = (s) => s
  .replace(/<span class="commento">[\s\S]*?<\/span>/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

const normalizza = (riga) => riga.replace(/\/\/.*$/, '').replace(/\s+/g, ' ').trim();

let pezzi = 0;
for (const m of html.matchAll(/<pre class="codice"[^>]*data-da-file="([^"]+)"[^>]*>([\s\S]*?)<\/pre>/g)) {
  pezzi++;
  const file = path.join(cartella, m[1]);
  if (!fs.existsSync(file)) { problemi.push(`il pezzo dice di venire da ${m[1]}, ma il file non esiste`); continue; }
  const sorgente = new Set(fs.readFileSync(file, 'utf8').split('\n').map(normalizza).filter(Boolean));
  for (const riga of decodifica(m[2]).split('\n')) {
    const r = normalizza(riga);
    if (r && r !== '...' && !sorgente.has(r)) problemi.push(`questa riga non c'è in ${m[1]}: ${r}`);
  }
}

for (const m of html.matchAll(/data-termine="([^"]+)"/g)) {
  if (!glossario[m[1].toLowerCase()]) problemi.push(`la parola "${m[1]}" non è nel glossario (${lingua})`);
}

if (problemi.length) {
  console.error('❌ La pagina "Come l\'ho fatto" ha ' + problemi.length + ' problemi:\n- ' + problemi.join('\n- '));
  process.exit(1);
}
console.log(`✅ Pagina controllata: ${pezzi} pezzi di codice veri, tutte le parole nel glossario.`);
