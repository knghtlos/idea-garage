#!/usr/bin/env node
// Prepara la cartella _site per GitHub Pages con SOLO i progetti pubblicati.
// Le bozze, i test e le specifiche tecniche non escono mai dal computer.
// Uso: node motore/costruisci-sito.mjs [cartella-garage]
import fs from 'node:fs';
import path from 'node:path';
import { generaIndice } from './genera-indice.mjs';

const radice = path.resolve(process.argv[2] || process.cwd());
const sito = path.join(radice, '_site');
const ESCLUSI = new Set(['test', 'spec.md', 'node_modules', 'test-results', 'AIUTO-PER-IL-GRANDE.md', 'modelli', 'richiesta.json']);

function copia(da, a) {
  const info = fs.statSync(da);
  if (info.isDirectory()) {
    fs.mkdirSync(a, { recursive: true });
    for (const f of fs.readdirSync(da)) {
      if (ESCLUSI.has(f)) continue;
      copia(path.join(da, f), path.join(a, f));
    }
  } else {
    fs.copyFileSync(da, a);
  }
}

fs.rmSync(sito, { recursive: true, force: true });
fs.mkdirSync(path.join(sito, 'giochi'), { recursive: true });

for (const f of ['index.html', 'portale.json', 'tema.css']) {
  if (fs.existsSync(path.join(radice, f))) copia(path.join(radice, f), path.join(sito, f));
}
copia(path.join(radice, 'motore'), path.join(sito, 'motore'));

const indice = generaIndice(radice, { soloPubblicati: true });
for (const p of indice.progetti) {
  copia(path.join(radice, 'giochi', p.slug), path.join(sito, 'giochi', p.slug));
}
fs.writeFileSync(path.join(sito, 'giochi', 'indice.json'), JSON.stringify(indice, null, 2) + '\n');
fs.writeFileSync(path.join(sito, '.nojekyll'), '');
console.log(`Sito pronto in _site con ${indice.progetti.length} progetti pubblicati.`);
