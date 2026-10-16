#!/usr/bin/env node
// Piccolo server locale del garage: serve il portale e i giochi su http://localhost:PORTA
// Uso: node motore/server.mjs [cartella-garage] [porta]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { generaIndice } from './genera-indice.mjs';

const radice = path.resolve(process.argv[2] || process.cwd());
const porta = Number(process.argv[3] || process.env.PORTA || 4321);

const TIPI = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.md': 'text/markdown; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    // L'elenco dei progetti si calcola ogni volta: è sempre aggiornato e non va mai salvato
    if (url.pathname === '/giochi/indice.json') {
      res.writeHead(200, { 'Content-Type': TIPI['.json'], 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(generaIndice(radice)));
    }
    let percorso = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    let file = path.join(radice, percorso);
    if (!file.startsWith(radice)) { res.writeHead(403); return res.end('No'); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { Location: url.pathname + '/' + url.search });
        return res.end();
      }
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Non trovato'); }
    res.writeHead(200, {
      'Content-Type': TIPI[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    res.writeHead(500); res.end('Errore');
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Il garage è già acceso su http://localhost:${porta}/`);
    process.exit(0);
  }
  throw e;
});

server.listen(porta, '127.0.0.1', () => {
  console.log(`Garage acceso su http://localhost:${porta}/`);
});
