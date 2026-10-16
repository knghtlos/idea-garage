#!/usr/bin/env node
// Esporta un progetto del garage in un pacchetto zip autonomo.
// Lo zip ha index.html nella radice: si può caricare così com'è su itch.io (gioco HTML),
// sul sito di una scuola o su qualsiasi sito web. Dentro c'è tutto: libreria, disegni, codice.
// Restano fuori i test, le note tecniche e i file del garage.
// Uso (dalla cartella del garage): node motore/esporta.mjs <slug>
// Risultato: esportati/<slug>-<data>.zip
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const MOTORE = path.dirname(fileURLToPath(import.meta.url));
const radice = process.cwd();
const slug = process.argv[2];
const sorgente = path.join(radice, 'giochi', slug || '');
if (!slug || !fs.existsSync(path.join(sorgente, 'index.html'))) {
  console.error('Non trovo giochi/' + slug + '/index.html');
  process.exit(1);
}

const ESCLUSI = new Set(['test', 'spec.md', 'richiesta.json', 'pubblicato.json', 'AIUTO-PER-IL-GRANDE.md', 'test-results', 'node_modules', '.DS_Store']);

// 1. Raccoglie i file del progetto
const file = new Map();
(function raccogli(dir, base) {
  for (const nome of fs.readdirSync(dir)) {
    if (ESCLUSI.has(nome)) continue;
    const pieno = path.join(dir, nome);
    const rel = base ? base + '/' + nome : nome;
    if (fs.statSync(pieno).isDirectory()) raccogli(pieno, rel);
    else file.set(rel, fs.readFileSync(pieno));
  }
})(sorgente, '');

// 2. Le pagine usano qualche file del motore del garage: lo mettiamo dentro il pacchetto
//    e correggiamo i percorsi, così il pacchetto non dipende più dal garage.
let serveMotore = false;
for (const [rel, contenuto] of file) {
  if (!rel.endsWith('.html')) continue;
  let html = contenuto.toString('utf8');
  if (html.includes('../../motore/')) {
    serveMotore = true;
    html = html.replaceAll('../../motore/', 'motore/');
  }
  // I link "torna al garage" non hanno senso fuori dal garage: si tolgono
  html = html.replace(/<a\b[^>]*href="\.\.\/\.\.\/"[^>]*>[\s\S]*?<\/a>\s*/g, '');
  file.set(rel, Buffer.from(html, 'utf8'));
}
if (serveMotore) {
  for (const f of ['pagine.css', 'come-funziona.js', 'glossario.json']) {
    file.set('motore/' + f, fs.readFileSync(path.join(MOTORE, f)));
  }
}

// 3. Controllo: nessun riferimento rimasto a file fuori dal pacchetto
const problemi = [];
for (const [rel, contenuto] of file) {
  if (!/\.(html|js|css)$/.test(rel) || rel.startsWith('libs/') || rel.startsWith('motore/')) continue;
  const testo = contenuto.toString('utf8');
  if (/["'(]\.\.\//.test(testo.replace(/\/\/.*$/gm, ''))) problemi.push(rel + ' usa ancora un percorso fuori dal pacchetto (../)');
}
if (problemi.length) { console.error('❌ ' + problemi.join('\n❌ ')); process.exit(2); }

// 4. Scrive lo zip (formato zip standard, senza programmi esterni)
const TABELLA_CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABELLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function dataDos(d) {
  return {
    ora: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    giorno: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  };
}

const adesso = new Date();
const { ora, giorno } = dataDos(adesso);
const pezzi = [];
const centrale = [];
let posizione = 0;
for (const [rel, dati] of [...file.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const nome = Buffer.from(rel, 'utf8');
  const compresso = zlib.deflateRawSync(dati, { level: 9 });
  const crc = crc32(dati);
  const locale = Buffer.alloc(30);
  locale.writeUInt32LE(0x04034b50, 0);
  locale.writeUInt16LE(20, 4);
  locale.writeUInt16LE(0x0800, 6); // nomi in UTF-8
  locale.writeUInt16LE(8, 8);      // deflate
  locale.writeUInt16LE(ora, 10);
  locale.writeUInt16LE(giorno, 12);
  locale.writeUInt32LE(crc, 14);
  locale.writeUInt32LE(compresso.length, 18);
  locale.writeUInt32LE(dati.length, 22);
  locale.writeUInt16LE(nome.length, 26);
  locale.writeUInt16LE(0, 28);
  pezzi.push(locale, nome, compresso);

  const voce = Buffer.alloc(46);
  voce.writeUInt32LE(0x02014b50, 0);
  voce.writeUInt16LE(20, 4);
  voce.writeUInt16LE(20, 6);
  voce.writeUInt16LE(0x0800, 8);
  voce.writeUInt16LE(8, 10);
  voce.writeUInt16LE(ora, 12);
  voce.writeUInt16LE(giorno, 14);
  voce.writeUInt32LE(crc, 16);
  voce.writeUInt32LE(compresso.length, 20);
  voce.writeUInt32LE(dati.length, 24);
  voce.writeUInt16LE(nome.length, 28);
  voce.writeUInt32LE(0, 38);
  voce.writeUInt32LE(posizione, 42);
  centrale.push(voce, nome);
  posizione += locale.length + nome.length + compresso.length;
}
const centraleBuf = Buffer.concat(centrale);
const fine = Buffer.alloc(22);
fine.writeUInt32LE(0x06054b50, 0);
fine.writeUInt16LE(file.size, 8);
fine.writeUInt16LE(file.size, 10);
fine.writeUInt32LE(centraleBuf.length, 12);
fine.writeUInt32LE(posizione, 16);

const cartella = path.join(radice, 'esportati');
fs.mkdirSync(cartella, { recursive: true });
const giornoTesto = adesso.toISOString().slice(0, 10);
const destinazione = path.join(cartella, `${slug}-${giornoTesto}.zip`);
fs.writeFileSync(destinazione, Buffer.concat([...pezzi, centraleBuf, fine]));

const kb = Math.round(fs.statSync(destinazione).size / 1024);
console.log(JSON.stringify({ zip: path.relative(radice, destinazione), file: file.size, kb }, null, 2));
