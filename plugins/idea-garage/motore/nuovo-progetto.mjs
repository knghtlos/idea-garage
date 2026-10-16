#!/usr/bin/env node
// Crea la cartella di un nuovo progetto nel garage, partendo da un modello.
// Uso (dalla cartella del garage):
//   node motore/nuovo-progetto.mjs --slug drago-volante --modello salta-e-corri \
//        --titolo "Il Drago delle Nuvole" --emoji "🐉" [--descrizione "..."] [--archetipo raccogli-ed-evita]
// Modelli: salta-e-corri (Phaser 2D), esplora-3d (Babylon.js), vuoto (HTML semplice, per quiz e app)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// I modelli vengono copiati dal plugin in motore/modelli quando si prepara il garage
const MODELLI = path.join(path.dirname(fileURLToPath(import.meta.url)), 'modelli');
const a = process.argv.slice(2);
const o = {};
for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[++i];

const garage = path.resolve(o.garage || process.cwd());
if (!fs.existsSync(path.join(garage, 'portale.json'))) { console.error('Non sono dentro un garage (manca portale.json).'); process.exit(1); }
const slug = String(o.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
if (!slug) { console.error('Serve --slug'); process.exit(1); }
const modello = o.modello || 'salta-e-corri';
const dir = path.join(garage, 'giochi', slug);
if (fs.existsSync(dir)) { console.error(`Esiste già giochi/${slug}: scegli un altro nome.`); process.exit(2); }

const ATTREZZI = {
  'salta-e-corri': { attrezzo: 'phaser', lib: ['phaser/dist/phaser.min.js', 'phaser.min.js'] },
  'esplora-3d': { attrezzo: 'babylon', lib: ['babylonjs/babylon.js', 'babylon.js'] },
  vuoto: { attrezzo: 'html', lib: null }
};
const info = ATTREZZI[modello];
if (!info) { console.error('Modello sconosciuto: ' + modello); process.exit(1); }

function copia(da, a) {
  fs.mkdirSync(a, { recursive: true });
  for (const f of fs.readdirSync(da)) {
    const s = path.join(da, f), d = path.join(a, f);
    if (fs.statSync(s).isDirectory()) copia(s, d); else fs.copyFileSync(s, d);
  }
}

const portale = JSON.parse(fs.readFileSync(path.join(garage, 'portale.json'), 'utf8'));
const lingua = portale.lingua === 'en' ? 'en' : 'it';
const T = {
  it: { TESTO_VITTORIA: 'Hai vinto! 🎉', TESTO_SCONFITTA: 'Oh no! 😮', TESTO_ANCORA: 'Gioca ancora', TESTO_RIPROVA: 'Riprova', TESTO_TASTI: 'Frecce per muoverti, spazio per saltare' },
  en: { TESTO_VITTORIA: 'You win! 🎉', TESTO_SCONFITTA: 'Oh no! 😮', TESTO_ANCORA: 'Play again', TESTO_RIPROVA: 'Try again', TESTO_TASTI: 'Arrows to move, space to jump' }
}[lingua];

fs.mkdirSync(path.join(dir, 'test'), { recursive: true });
fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
if (modello !== 'vuoto') {
  copia(path.join(MODELLI, 'giochi', modello), dir);
  const indice = path.join(dir, 'index.html');
  fs.writeFileSync(indice, fs.readFileSync(indice, 'utf8')
    .replace(/<html lang="[a-z]+">/, `<html lang="${lingua}">`)
    .replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k === 'TITOLO' ? (o.titolo || slug) : (T[k] || m))));
} else {
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="${lingua}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${o.titolo || slug}</title>
  <style>body { margin: 0; font-family: system-ui, sans-serif; } </style>
</head>
<body>
  <main data-gioco></main>
  <a href="../../">🏠</a>
  <script src="gioco.js"></script>
</body>
</html>
`);
  fs.writeFileSync(path.join(dir, 'gioco.js'), `// Le regole: i numeri e le parole che si possono voler cambiare\nconst REGOLE = {};\n\nwindow.gioco = { pronto: true, regole: REGOLE, stato: () => ({}), scorciatoie: {} };\n`);
}
fs.copyFileSync(path.join(MODELLI, 'test', 'base.spec.mjs'), path.join(dir, 'test', 'base.spec.mjs'));

if (info.lib) {
  const sorgente = path.join(garage, 'node_modules', info.lib[0]);
  if (!fs.existsSync(sorgente)) { console.error(`Manca ${info.lib[0]}: esegui prima "npm install" nel garage.`); process.exit(3); }
  fs.mkdirSync(path.join(dir, 'libs'), { recursive: true });
  fs.copyFileSync(sorgente, path.join(dir, 'libs', info.lib[1]));
}

const adesso = new Date().toISOString();
fs.writeFileSync(path.join(dir, 'gioco.json'), JSON.stringify({
  titolo: o.titolo || slug,
  descrizione: o.descrizione || '',
  tipo: o.archetipo === 'app' ? 'app' : 'gioco',
  emoji: o.emoji || '🎮',
  archetipo: o.archetipo || modello,
  attrezzo: info.attrezzo,
  modello,
  creato: adesso,
  aggiornato: adesso,
  copertina: 'copertina.png',
  salvataggi: []
}, null, 2) + '\n');

for (const f of ['spec.md', 'IL-MIO-GIOCO.md', 'carta.html']) {
  fs.copyFileSync(path.join(MODELLI, 'progetto', f), path.join(dir, f));
}

portale.progetto_attivo = slug;
fs.writeFileSync(path.join(garage, 'portale.json'), JSON.stringify(portale, null, 2) + '\n');

console.log(JSON.stringify({ creato: `giochi/${slug}`, modello, attrezzo: info.attrezzo, lingua }, null, 2));
