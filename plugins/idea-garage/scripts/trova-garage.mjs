// Trova la cartella del garage risalendo da una cartella qualsiasi.
import fs from 'node:fs';
import path from 'node:path';

export function trovaGarage(da) {
  let dir = path.resolve(da || process.cwd());
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, 'portale.json')) && fs.existsSync(path.join(dir, 'motore'))) return dir;
    const su = path.dirname(dir);
    if (su === dir) break;
    dir = su;
  }
  return null;
}

export function leggiJSON(file, ripiego = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return ripiego; }
}

export async function leggiStdin() {
  let dati = '';
  for await (const pezzo of process.stdin) dati += pezzo;
  try { return JSON.parse(dati || '{}'); } catch { return {}; }
}
