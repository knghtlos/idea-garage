#!/usr/bin/env node
// Hook SessionStart: se la sessione parte dentro un Idea Garage, dà a Claude
// lo stato del garage, così può salutare e proporre da dove ripartire.
// Fuori da un garage non fa niente.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { trovaGarage, leggiJSON, leggiStdin } from './trova-garage.mjs';

const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ingresso = await leggiStdin();
const garage = trovaGarage(ingresso.cwd || process.cwd());

function rispondi(testo) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: testo } }));
  process.exit(0);
}

if (!garage) {
  // Non siamo in un garage: basta ricordare che il plugin esiste, in una riga.
  rispondi(`Idea Garage plugin is installed (root: ${PLUGIN}). This folder is not a garage. If the user wants to make a game or a small app, use the skill idea-garage:new-game, which sets up a garage first.`);
}

const portale = leggiJSON(path.join(garage, 'portale.json'), {});
const versionePlugin = leggiJSON(path.join(PLUGIN, '.claude-plugin', 'plugin.json'), {}).version;
const versioneMotore = (leggiJSON(path.join(garage, 'motore', 'versione.json'), {}) || {}).versione;
const progetti = [];
const cartellaGiochi = path.join(garage, 'giochi');
if (fs.existsSync(cartellaGiochi)) {
  for (const nome of fs.readdirSync(cartellaGiochi)) {
    const g = leggiJSON(path.join(cartellaGiochi, nome, 'gioco.json'));
    if (!g) continue;
    const ultimo = (g.salvataggi || []).slice(-1)[0];
    let doveEravamo = '';
    try {
      const md = fs.readFileSync(path.join(cartellaGiochi, nome, 'IL-MIO-GIOCO.md'), 'utf8');
      const sezione = md.split(/^## (?:Dove eravamo|Where we were)\s*$/m)[1] || '';
      doveEravamo = sezione.split(/^## /m)[0].replace(/<!--[\s\S]*?-->/g, '')
        .split('\n').map((r) => r.trim()).find(Boolean) || '';
    } catch { /* niente */ }
    const stato = fs.existsSync(path.join(cartellaGiochi, nome, 'pubblicato.json')) ? 'pubblicato'
      : (fs.existsSync(path.join(cartellaGiochi, nome, 'richiesta.json')) ? 'in-attesa' : 'bozza');
    progetti.push({ slug: nome, titolo: g.titolo, stato, aggiornato: g.aggiornato, ultimoSalvataggio: ultimo ? ultimo.nome : null, doveEravamo });
  }
}
progetti.sort((a, b) => String(b.aggiornato || '').localeCompare(String(a.aggiornato || '')));

const righe = [
  `You are inside an Idea Garage (folder: ${garage}). Plugin root: ${PLUGIN}.`,
  `Garage: name "${portale.nome}", language ${portale.lingua}, profile ${portale.profilo}, mascot ${portale.mascotte}.`,
  `Experience: ${JSON.stringify(portale.esperienza || {})}. Active project: ${portale.progetto_attivo || 'none'}.`,
  `Projects (${progetti.length}): ${progetti.length ? progetti.map((p) => `${p.slug} "${p.titolo}" [${p.stato}${p.ultimoSalvataggio ? ', last save: ' + p.ultimoSalvataggio : ''}${p.doveEravamo ? ', where we were: ' + p.doveEravamo : ''}]`).join('; ') : 'none yet'}.`,
  versioneMotore && versionePlugin && versioneMotore !== versionePlugin
    ? `The garage engine is version ${versioneMotore}, the plugin is ${versionePlugin}: offer the grown-up to update it with: node "${PLUGIN}/scripts/prepara-garage.mjs" --cartella "${garage}" --aggiorna`
    : '',
  `RULES: before your first reply, read ${PLUGIN}/riferimenti/tono.md and follow it for the whole session (language, short sentences, one question at a time, always a next step).`,
  `GREETING: when the user writes their first message (even just "ciao"/"hi"), unless it is already a clear request, greet them as described in the "Greeting" section of the skill idea-garage:help-me, using the news above (projects waiting for the OK, the active project and "where we were").`,
  `Understand requests in plain words and start the right skill yourself: new idea → idea-garage:new-game; try → idea-garage:try-game; add/change → idea-garage:improve; something broken → idea-garage:fix; undo → idea-garage:go-back; curiosity about how it's made → idea-garage:how-it-works; show the world → idea-garage:publish; lost or stuck → idea-garage:help-me.`
].filter(Boolean);

rispondi(righe.join('\n'));
