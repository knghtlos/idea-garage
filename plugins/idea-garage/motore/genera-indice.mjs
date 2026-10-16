#!/usr/bin/env node
// Rigenera giochi/indice.json leggendo tutti i giochi/*/gioco.json.
// Uso: node motore/genera-indice.mjs [cartella-garage] [--solo-pubblicati]
// Il portale non si aggiorna mai a mano: si rigenera sempre con questo script.
import fs from 'node:fs';
import path from 'node:path';

export function generaIndice(radice, { soloPubblicati = false } = {}) {
  const cartella = path.join(radice, 'giochi');
  const progetti = [];
  if (fs.existsSync(cartella)) {
    for (const nome of fs.readdirSync(cartella).sort()) {
      const dir = path.join(cartella, nome);
      const scheda = path.join(dir, 'gioco.json');
      if (!fs.statSync(dir).isDirectory() || !fs.existsSync(scheda)) continue;
      let g;
      try { g = JSON.parse(fs.readFileSync(scheda, 'utf8')); } catch { continue; }
      // Lo stato non si scrive a mano: nasce dai file.
      //  pubblicato.json  -> c'è solo se la pubblicazione è stata approvata (arriva con la richiesta di via libera)
      //  richiesta.json   -> file locale (non salvato in git): la richiesta è partita e aspetta il via libera
      const statoVero = fs.existsSync(path.join(dir, 'pubblicato.json'))
        ? 'pubblicato'
        : (fs.existsSync(path.join(dir, 'richiesta.json')) ? 'in-attesa' : 'bozza');
      if (soloPubblicati && statoVero !== 'pubblicato') continue;
      const copertina = g.copertina && fs.existsSync(path.join(dir, g.copertina)) ? g.copertina : null;
      progetti.push({
        slug: nome,
        titolo: g.titolo || nome,
        descrizione: g.descrizione || '',
        tipo: g.tipo || 'gioco',
        emoji: g.emoji || '🎮',
        stato: statoVero,
        creato: g.creato || '',
        aggiornato: g.aggiornato || g.creato || '',
        copertina,
        comeFunziona: fs.existsSync(path.join(dir, 'come-e-fatto.html'))
      });
    }
  }
  return { generato: new Date().toISOString(), progetti };
}

const eseguitoDirettamente = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (eseguitoDirettamente) {
  const argomenti = process.argv.slice(2);
  const soloPubblicati = argomenti.includes('--solo-pubblicati');
  const radice = path.resolve(argomenti.find((a) => !a.startsWith('--')) || process.cwd());
  const indice = generaIndice(radice, { soloPubblicati });
  fs.mkdirSync(path.join(radice, 'giochi'), { recursive: true });
  fs.writeFileSync(path.join(radice, 'giochi', 'indice.json'), JSON.stringify(indice, null, 2) + '\n');
  console.log(`Portale aggiornato: ${indice.progetti.length} progetti.`);
}
