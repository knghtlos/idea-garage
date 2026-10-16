#!/usr/bin/env node
// Aggiunge alla vetrina un gioco esportato con /esporta (lo zip creato da Idea Garage).
// Uso, dalla cartella del repository:
//   node sito/aggiungi-gioco.mjs <gioco.zip> --autore "Leo, 8 anni" [--slug nome] [--descrizione "..."]
// Il gioco finisce in sito/giochi/<slug>/ e nell'elenco sito/giochi.json.
// Usare sempre un nickname: mai nome e cognome.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const SITO = path.dirname(fileURLToPath(import.meta.url));
const a = process.argv.slice(2);
const zip = a.find((x) => !x.startsWith('--') && !a[a.indexOf(x) - 1]?.startsWith('--'));
const opzione = (nome) => { const i = a.indexOf('--' + nome); return i >= 0 ? a[i + 1] : undefined; };
if (!zip || !fs.existsSync(zip)) { console.error('Uso: node sito/aggiungi-gioco.mjs <gioco.zip> --autore "Leo, 8 anni"'); process.exit(1); }

// Legge lo zip (formato standard: file salvati o compressi con deflate)
const dati = fs.readFileSync(zip);
let fine = dati.length - 22;
while (fine >= 0 && dati.readUInt32LE(fine) !== 0x06054b50) fine--;
if (fine < 0) { console.error('Questo file non sembra uno zip.'); process.exit(1); }
const quanti = dati.readUInt16LE(fine + 10);
let p = dati.readUInt32LE(fine + 16);
const file = new Map();
for (let i = 0; i < quanti; i++) {
  if (dati.readUInt32LE(p) !== 0x02014b50) { console.error('Zip rovinato.'); process.exit(1); }
  const metodo = dati.readUInt16LE(p + 10);
  const compressa = dati.readUInt32LE(p + 20);
  const lNome = dati.readUInt16LE(p + 28);
  const lExtra = dati.readUInt16LE(p + 30);
  const lCommento = dati.readUInt16LE(p + 32);
  const locale = dati.readUInt32LE(p + 42);
  const nome = dati.slice(p + 46, p + 46 + lNome).toString('utf8');
  p += 46 + lNome + lExtra + lCommento;
  if (nome.endsWith('/')) continue;
  if (nome.includes('..') || path.isAbsolute(nome)) { console.error('Percorso non permesso nello zip: ' + nome); process.exit(1); }
  const inizio = locale + 30 + dati.readUInt16LE(locale + 26) + dati.readUInt16LE(locale + 28);
  const pezzo = dati.slice(inizio, inizio + compressa);
  if (metodo === 0) file.set(nome, pezzo);
  else if (metodo === 8) file.set(nome, zlib.inflateRawSync(pezzo));
  else { console.error('Compressione non supportata in ' + nome); process.exit(1); }
}

// Lo zip può avere i file nella radice (come quelli di /esporta) o dentro una cartella
let prefisso = '';
if (!file.has('index.html')) {
  const conIndice = [...file.keys()].find((k) => /^[^/]+\/index\.html$/.test(k));
  if (!conIndice) { console.error('Nello zip non trovo index.html.'); process.exit(1); }
  prefisso = conIndice.replace('index.html', '');
}
const scheda = file.get(prefisso + 'gioco.json') ? JSON.parse(file.get(prefisso + 'gioco.json').toString('utf8')) : {};
const slug = (opzione('slug') || path.basename(zip).replace(/\.zip$/, '').replace(/-\d{4}-\d{2}-\d{2}$/, ''))
  .toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const destinazione = path.join(SITO, 'giochi', slug);
if (fs.existsSync(destinazione)) { console.error(`C'è già sito/giochi/${slug}: usa --slug con un altro nome.`); process.exit(2); }

for (const [nome, contenuto] of file) {
  if (!nome.startsWith(prefisso)) continue;
  const finale = path.join(destinazione, nome.slice(prefisso.length));
  fs.mkdirSync(path.dirname(finale), { recursive: true });
  fs.writeFileSync(finale, contenuto);
}

const elenco = path.join(SITO, 'giochi.json');
const vetrina = JSON.parse(fs.readFileSync(elenco, 'utf8'));
vetrina.giochi.unshift({
  slug,
  titolo: scheda.titolo || slug,
  descrizione: opzione('descrizione') || scheda.descrizione || '',
  autore: opzione('autore') || '',
  tipo: 'creato',
  carta: fs.existsSync(path.join(destinazione, 'carta.html')),
  comeFatto: fs.existsSync(path.join(destinazione, 'come-e-fatto.html'))
});
fs.writeFileSync(elenco, JSON.stringify(vetrina, null, 2) + '\n');
console.log(`✅ "${scheda.titolo || slug}" aggiunto alla vetrina in sito/giochi/${slug}. Fai commit e push per pubblicarlo.`);
