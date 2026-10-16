#!/usr/bin/env node
// Prepara (o aggiorna) un Idea Garage.
//
// Nuovo garage:
//   node prepara-garage.mjs --cartella <dir> --lingua it|en --profilo bambino|adulto \
//        --nome "Il Garage di Leo" --colore "#6c5ce7" --mascotte "🐉"
// Aggiornare il motore di un garage esistente (non tocca portale.json, tema.css, giochi/):
//   node prepara-garage.mjs --cartella <dir> --aggiorna
//
// Scrive un riepilogo JSON su stdout.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSIONE = JSON.parse(fs.readFileSync(path.join(PLUGIN, '.claude-plugin', 'plugin.json'), 'utf8')).version;

// Comandi brevi nella lingua del garage: ognuno passa la parola alla skill vera del plugin.
const SCORCIATOIE = {
  'new-game': { it: ['nuovo-gioco', 'Inizia un nuovo gioco (o una nuova idea) nel garage'], en: ['new-game', 'Start a new game (or a new idea) in the garage'] },
  'try-game': { it: ['prova-il-gioco', 'Apri il gioco nel browser per provarlo'], en: ['try-game', 'Open the game in the browser to try it'] },
  improve: { it: ['migliora', 'Aggiungi o cambia qualcosa nel gioco, o personalizza il portale'], en: ['improve', 'Add or change something in the game, or customise the portal'] },
  fix: { it: ['aggiusta', 'Qualcosa nel gioco non va come avevamo deciso'], en: ['fix', 'Something in the game does not work as we decided'] },
  'go-back': { it: ['torna-indietro', 'Torna a un salvataggio precedente del gioco'], en: ['go-back', 'Go back to an earlier save of the game'] },
  'how-it-works': { it: ['come-funziona', 'Scopri come è fatto il tuo gioco, dietro le quinte'], en: ['how-it-works', 'Find out how your game is made, behind the scenes'] },
  publish: { it: ['pubblica', 'Fai vedere il gioco al mondo (con il via libera del grande)'], en: ['publish', 'Show your game to the world (with the grown-up\'s OK)'] },
  'help-me': { it: ['aiuto', 'Vedi tutti i comandi, oppure chiama un grande'], en: ['help-me', 'See all the commands, or call a grown-up'] }
};

function argomenti() {
  const a = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--aggiorna') o.aggiorna = true;
    else if (a[i].startsWith('--')) o[a[i].slice(2)] = a[++i];
  }
  return o;
}

function copiaCartella(da, a, salta = new Set()) {
  fs.mkdirSync(a, { recursive: true });
  for (const f of fs.readdirSync(da)) {
    if (salta.has(f)) continue;
    const sorgente = path.join(da, f);
    const destinazione = path.join(a, f);
    if (fs.statSync(sorgente).isDirectory()) copiaCartella(sorgente, destinazione);
    else fs.copyFileSync(sorgente, destinazione);
  }
}

function riempi(testo, valori) {
  return testo.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in valori ? valori[k] : m));
}

function slugga(t) {
  return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'il-mio-garage';
}

function scriviScorciatoie(garage, lingua) {
  const cartella = path.join(garage, '.claude', 'skills');
  // Toglie le scorciatoie di una lingua precedente, così il menu mostra solo quelle giuste
  for (const voce of Object.values(SCORCIATOIE)) {
    for (const l of ['it', 'en']) {
      const dir = path.join(cartella, voce[l][0]);
      if (fs.existsSync(path.join(dir, '.idea-garage'))) fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  for (const [vera, voce] of Object.entries(SCORCIATOIE)) {
    const [nome, descrizione] = voce[lingua];
    const dir = path.join(cartella, nome);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '.idea-garage'), 'scorciatoia creata da Idea Garage\n');
    fs.writeFileSync(path.join(dir, 'SKILL.md'),
`---
name: ${nome}
description: ${descrizione}. Scorciatoia del garage per la skill idea-garage:${vera}.
---

Use the Skill tool right now to run the skill \`idea-garage:${vera}\`, passing these arguments: $ARGUMENTS
Then follow that skill exactly. Do not answer before running it.
`);
  }
}

function unisciPermessi(garage) {
  const file = path.join(garage, '.claude', 'settings.json');
  const modello = JSON.parse(fs.readFileSync(path.join(PLUGIN, 'modelli', 'garage', 'claude', 'settings.json'), 'utf8'));
  let attuale = {};
  if (fs.existsSync(file)) { try { attuale = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { attuale = {}; } }
  const permessi = attuale.permissions || {};
  const unione = (x = [], y = []) => Array.from(new Set([...x, ...y]));
  attuale.permissions = {
    ...permessi,
    defaultMode: permessi.defaultMode || modello.permissions.defaultMode,
    allow: unione(permessi.allow, modello.permissions.allow),
    deny: unione(permessi.deny, modello.permissions.deny)
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(attuale, null, 2) + '\n');
}

function copiaMotore(garage) {
  copiaCartella(path.join(PLUGIN, 'motore'), path.join(garage, 'motore'), new Set(['index.html']));
  // I modelli dei progetti viaggiano con il motore, così motore/nuovo-progetto.mjs li trova sempre
  for (const m of ['giochi', 'progetto', 'test']) {
    copiaCartella(path.join(PLUGIN, 'modelli', m), path.join(garage, 'motore', 'modelli', m));
  }
  fs.copyFileSync(path.join(PLUGIN, 'motore', 'index.html'), path.join(garage, 'index.html'));
  fs.writeFileSync(path.join(garage, 'motore', 'versione.json'), JSON.stringify({ versione: VERSIONE }, null, 2) + '\n');
  const m = path.join(PLUGIN, 'modelli', 'garage');
  fs.copyFileSync(path.join(m, 'playwright.config.mjs'), path.join(garage, 'playwright.config.mjs'));
  fs.mkdirSync(path.join(garage, '.github', 'workflows'), { recursive: true });
  fs.copyFileSync(path.join(m, 'github', 'pubblica.yml'), path.join(garage, '.github', 'workflows', 'pubblica.yml'));
  unisciPermessi(garage);
}

function git(garage, ...a) {
  return execFileSync('git', a, { cwd: garage, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

const o = argomenti();
if (!o.cartella) { console.error('Serve --cartella'); process.exit(1); }
const garage = path.resolve(o.cartella);
const riepilogo = { garage, versione: VERSIONE, fatto: [], attenzione: [] };

if (o.aggiorna) {
  if (!fs.existsSync(path.join(garage, 'portale.json'))) { console.error('Qui non c\'è un garage da aggiornare.'); process.exit(1); }
  copiaMotore(garage);
  const portale = JSON.parse(fs.readFileSync(path.join(garage, 'portale.json'), 'utf8'));
  portale.versione_motore = VERSIONE;
  fs.writeFileSync(path.join(garage, 'portale.json'), JSON.stringify(portale, null, 2) + '\n');
  scriviScorciatoie(garage, portale.lingua === 'en' ? 'en' : 'it');
  riepilogo.fatto.push('motore aggiornato', 'scorciatoie aggiornate', 'permessi uniti');
} else {
  if (fs.existsSync(path.join(garage, 'portale.json'))) {
    console.error('Qui c\'è già un garage. Per aggiornarlo usa --aggiorna.');
    process.exit(2);
  }
  const lingua = o.lingua === 'en' ? 'en' : 'it';
  const profilo = o.profilo === 'adulto' ? 'adulto' : 'bambino';
  const nome = o.nome || (lingua === 'en' ? 'My Idea Garage' : 'Il mio Idea Garage');
  fs.mkdirSync(path.join(garage, 'giochi'), { recursive: true });
  copiaMotore(garage);
  const m = path.join(PLUGIN, 'modelli', 'garage');
  fs.writeFileSync(path.join(garage, 'package.json'), riempi(fs.readFileSync(path.join(m, 'package.json'), 'utf8'), { SLUG_PORTALE: slugga(nome) }));
  fs.writeFileSync(path.join(garage, 'portale.json'), riempi(fs.readFileSync(path.join(m, 'portale.json'), 'utf8'), {
    NOME_PORTALE: nome.replace(/"/g, '\''),
    COLORE: /^#[0-9a-f]{3,8}$/i.test(o.colore || '') ? o.colore : '#6c5ce7',
    MASCOTTE: o.mascotte || '🚗',
    LINGUA: lingua,
    PROFILO: profilo,
    VERSIONE
  }));
  if (!fs.existsSync(path.join(garage, 'tema.css'))) fs.copyFileSync(path.join(m, 'tema.css'), path.join(garage, 'tema.css'));
  const gi = path.join(garage, '.gitignore');
  if (!fs.existsSync(gi)) fs.copyFileSync(path.join(m, 'gitignore'), gi);
  scriviScorciatoie(garage, lingua);
  riepilogo.fatto.push('garage creato', 'portale pronto', 'permessi scritti in .claude/settings.json', `scorciatoie in ${lingua}`);

  try {
    try { git(garage, 'rev-parse', '--is-inside-work-tree'); } catch { git(garage, 'init', '-b', 'main'); riepilogo.fatto.push('git inizializzato'); }
    git(garage, 'add', '-A');
    git(garage, 'commit', '-m', lingua === 'en' ? '🚗 The garage is ready' : '🚗 Il garage è pronto');
    riepilogo.fatto.push('primo salvataggio');
  } catch (e) {
    riepilogo.attenzione.push('primo salvataggio non riuscito: serve configurare git (git config user.name / user.email)');
  }
}

console.log(JSON.stringify(riepilogo, null, 2));
