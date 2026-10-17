#!/usr/bin/env node
// Hook PreToolUse: la guardia del garage.
// Dentro un Idea Garage blocca quello che non deve mai succedere, anche per sbaglio:
// lavorare fuori dal garage, toccare il motore, scaricare cose, cancellare, approvare pubblicazioni.
// Fuori da un garage non fa niente.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { trovaGarage, leggiJSON, leggiStdin } from './trova-garage.mjs';

const ingresso = await leggiStdin();
const garage = trovaGarage(ingresso.cwd || process.cwd());
if (!garage) process.exit(0);

const profilo = (leggiJSON(path.join(garage, 'portale.json'), {}) || {}).profilo === 'adulto' ? 'adulto' : 'bambino';

function nega(motivo) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `Idea Garage guard: ${motivo} Tell the person kindly in one sentence, in the garage language, and offer another way (or the "call a grown-up" step of idea-garage:help-me).`
    }
  }));
  process.exit(0);
}

const MOTORE = [/^motore(\/|$)/, /^index\.html$/, /^playwright\.config\.mjs$/, /^\.github(\/|$)/, /^\.claude\/settings(\.local)?\.json$/];

function dentroGarage(file) {
  const assoluto = path.resolve(ingresso.cwd || garage, file);
  const relativo = path.relative(garage, assoluto);
  return { assoluto, relativo, dentro: !relativo.startsWith('..') && !path.isAbsolute(relativo) };
}

const strumento = ingresso.tool_name;
const input = ingresso.tool_input || {};

if (['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(strumento)) {
  const file = input.file_path || input.notebook_path;
  if (!file) process.exit(0);
  const { relativo, dentro } = dentroGarage(file);
  if (!dentro) nega(`writing outside the garage folder is not allowed (${file}).`);
  const rel = relativo.split(path.sep).join('/');
  if (MOTORE.some((r) => r.test(rel))) {
    nega(`"${rel}" is part of the garage engine and is only changed by updating the plugin. To personalise the portal change only portale.json and tema.css; game files live in giochi/<project>/.`);
  }
  // Il comando "dopo_esportazione" lo imposta solo il grande (via prepara-garage.mjs, con la sua approvazione):
  // Claude non può cambiarlo scrivendo portale.json, altrimenti potrebbe far partire comandi qualsiasi.
  if (rel === 'portale.json') {
    const leggi = (t) => { try { return (JSON.parse(t) || {}).dopo_esportazione ?? null; } catch { return undefined; } };
    let attuale = null;
    try { attuale = leggi(fs.readFileSync(path.join(garage, 'portale.json'), 'utf8')); } catch { /* niente */ }
    const pezzi = [input.old_string, input.new_string, ...(input.edits || []).flatMap((e) => [e.old_string, e.new_string])];
    const tocca = pezzi.some((x) => typeof x === 'string' && x.includes('dopo_esportazione'));
    const cambia = typeof input.content === 'string' && leggi(input.content) !== attuale;
    if (tocca || cambia) {
      nega('the "dopo_esportazione" setting can only be changed by the grown-up, with: /idea-garage:start impostazioni.');
    }
  }
  process.exit(0);
}

if (strumento === 'Bash') {
  const comando = String(input.command || '');
  const c = comando.replace(/\s+/g, ' ');

  if (/\bsudo\b/.test(c)) nega('administrator commands are not allowed.');
  if (/dopo_esportazione/.test(c) && !/prepara-garage\.mjs/.test(c)) nega('the "dopo_esportazione" setting can only be changed by the grown-up, with: /idea-garage:start impostazioni.');
  if (/\b(curl|wget|Invoke-WebRequest|iwr)\b/.test(c)) nega('downloading from the internet is not allowed in the garage (npm install and "npx playwright install chromium" are the only allowed downloads).');
  if (/\bnpm (publish|unpublish)\b/.test(c)) nega('publishing npm packages is not part of the garage.');
  if (/\bgh pr merge\b/.test(c) || /\bgh api\b.*\/merge\b/.test(c)) nega('approving a publishing request is the grown-up\'s decision, on GitHub. Never merge it.');
  if (/\bgh repo delete\b/.test(c)) nega('deleting repositories is not allowed.');
  if (/\bgit (reset --hard|clean\b|push (-f|--force)|branch -D|filter-branch|rebase)/.test(c)) nega('this git command can destroy saves. Use idea-garage:go-back to return to an earlier save instead.');
  if (/\bgit push\b/.test(c) && /\b--delete\b|\s:\S/.test(c)) nega('deleting branches on GitHub is not allowed.');

  // Cancellazioni: solo cartelle di lavoro che si rigenerano da sole
  const rm = c.match(/\brm\s+(-[a-zA-Z]+\s+)*(.+)/);
  if (rm) {
    const bersagli = rm[2].split(' ').filter((x) => x && !x.startsWith('-') && !/[;&|]/.test(x));
    const rigenerabili = /^(test-results|playwright-report|_site|node_modules)(\/|$)|\/(test-results|foto)(\/|$)|copertina\.png$|^giochi\/[^/]+\/richiesta\.json$/;
    for (const b of bersagli) {
      const { relativo, dentro } = dentroGarage(b.replace(/^["']|["']$/g, ''));
      const rel = relativo.split(path.sep).join('/');
      if (!dentro || rel === '' || rel === '.' || /[*?]/.test(b) || !rigenerabili.test(rel)) {
        nega(`deleting "${b}" is not allowed. Projects and saves are never deleted; to undo changes use idea-garage:go-back.`);
      }
    }
  }

  // Pubblicazione: per i bambini mai direttamente su main, solo richieste di via libera
  if (profilo === 'bambino' && /\bgit push\b/.test(c)) {
    let ramo = '';
    try { ramo = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: garage }).toString().trim(); } catch { /* niente */ }
    const versoMain = /\b(main|master)\b/.test(c.replace(/^.*\bgit push\b/, '')) || (!/\bgit push \S+ \S+/.test(c) && /^(main|master)$/.test(ramo));
    if (versoMain) nega('in a child\'s garage nothing goes to main directly: publishing happens through a request for the OK on a "pubblica/<project>" branch (skill idea-garage:publish).');
  }
}

process.exit(0);
