// =============================================================
//  MODELLO "ESPLORA IN 3D" (Babylon.js)
//  Un mondo 3D in stile low-poly: l'eroe corre, salta e raccoglie gemme.
//  Regola d'oro: i numeri che si possono voler cambiare stanno in REGOLE.
// =============================================================

const REGOLE = {
  velocita: 7,            // quanto corre l'eroe
  forzaSalto: 8,          // quanto salta in alto
  gravita: 22,            // quanto forte tira giù la gravità
  gemmePerVincere: 8,     // quante gemme servono per vincere
  vite: 3,                // quante volte puoi cadere dal mondo
  coloreCielo: '#9fd8ff'  // il colore del cielo
};

// Le isole su cui si cammina: centro (x, z), grandezza e altezza
const ISOLE = [
  { x: 0, z: 0, lato: 14, altezza: 0 },
  { x: 14, z: 4, lato: 8, altezza: 1.5 },
  { x: -12, z: -6, lato: 8, altezza: 1 },
  { x: 2, z: -16, lato: 9, altezza: 2.5 }
];
const GEMME = [
  { x: 3, z: 3 }, { x: -4, z: 2 }, { x: 0, z: -5 }, { x: 14, z: 4 }, { x: 16, z: 6 },
  { x: -12, z: -6 }, { x: -14, z: -4 }, { x: 2, z: -16 }, { x: 4, z: -18 }, { x: 0, z: -14 }
];
const PARTENZA = { x: 0, z: 4 };

let audio = null;
function suono(tipo) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const volume = audio.createGain();
    const note = { gemma: [880, 1320], salto: [300, 520], caduta: [400, 120], vittoria: [523, 1046] }[tipo] || [440, 440];
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note[0], audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(note[1], audio.currentTime + 0.15);
    volume.gain.setValueAtTime(0.15, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.25);
    osc.connect(volume).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.25);
  } catch (e) { /* va bene anche senza audio */ }
}

const stato = { gemme: 0, vite: REGOLE.vite, finito: null, fotogrammi: 0 };
const tasti = {};
window.addEventListener('keydown', (e) => { tasti[e.code] = true; });
window.addEventListener('keyup', (e) => { tasti[e.code] = false; });

const tela = document.getElementById('tela');
const motore = new BABYLON.Engine(tela, true, { preserveDrawingBuffer: true, stencil: true });
const scena = new BABYLON.Scene(motore);
scena.clearColor = BABYLON.Color4.FromHexString(REGOLE.coloreCielo + 'ff');

// Luci: una dal cielo e un "sole" che fa le ombre
new BABYLON.HemisphericLight('cielo', new BABYLON.Vector3(0, 1, 0), scena).intensity = 0.75;
const sole = new BABYLON.DirectionalLight('sole', new BABYLON.Vector3(-0.5, -1, -0.4), scena);
sole.position = new BABYLON.Vector3(20, 40, 20);
const ombre = new BABYLON.ShadowGenerator(1024, sole);
ombre.useBlurExponentialShadowMap = true;

function materiale(nome, esadecimale) {
  const m = new BABYLON.StandardMaterial(nome, scena);
  m.diffuseColor = BABYLON.Color3.FromHexString(esadecimale);
  m.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  return m;
}

// Le isole
ISOLE.forEach((isola, i) => {
  const blocco = BABYLON.MeshBuilder.CreateBox('isola' + i, { width: isola.lato, depth: isola.lato, height: 1 }, scena);
  blocco.position.set(isola.x, isola.altezza - 0.5, isola.z);
  blocco.material = materiale('erba' + i, '#4caf6a');
  blocco.receiveShadows = true;
});

// L'eroe: un corpo tondo con gli occhi (il costruttore lo ridisegna come lo ha scelto il bambino)
const eroe = new BABYLON.TransformNode('eroe', scena);
const corpo = BABYLON.MeshBuilder.CreateSphere('corpo', { diameter: 1.2, segments: 12 }, scena);
corpo.parent = eroe;
corpo.position.y = 0.6;
corpo.material = materiale('pelle', '#6c5ce7');
[-0.22, 0.22].forEach((x, i) => {
  const occhio = BABYLON.MeshBuilder.CreateSphere('occhio' + i, { diameter: 0.28 }, scena);
  occhio.parent = eroe;
  occhio.position.set(x, 0.8, 0.5);
  occhio.material = materiale('bianco' + i, '#ffffff');
  const pupilla = BABYLON.MeshBuilder.CreateSphere('pupilla' + i, { diameter: 0.13 }, scena);
  pupilla.parent = eroe;
  pupilla.position.set(x, 0.8, 0.62);
  pupilla.material = materiale('nero' + i, '#2d2a32');
});
ombre.addShadowCaster(corpo);

// Le gemme
const gemme = GEMME.map((g, i) => {
  const isola = isolaSotto(g.x, g.z);
  const gemma = BABYLON.MeshBuilder.CreatePolyhedron('gemma' + i, { type: 1, size: 0.35 }, scena);
  gemma.position.set(g.x, (isola ? isola.altezza : 0) + 1, g.z);
  gemma.material = materiale('gemma' + i, '#ffd23f');
  gemma.material.emissiveColor = new BABYLON.Color3(0.4, 0.3, 0);
  ombre.addShadowCaster(gemma);
  return gemma;
});

// La telecamera segue l'eroe da dietro e dall'alto
const telecamera = new BABYLON.ArcRotateCamera('telecamera', -Math.PI / 2, 1.0, 16, BABYLON.Vector3.Zero(), scena);
telecamera.lockedTarget = eroe;

function isolaSotto(x, z) {
  let migliore = null;
  ISOLE.forEach((isola) => {
    const dentro = Math.abs(x - isola.x) <= isola.lato / 2 && Math.abs(z - isola.z) <= isola.lato / 2;
    if (dentro && (!migliore || isola.altezza > migliore.altezza)) migliore = isola;
  });
  return migliore;
}

let velocitaY = 0;
let aTerra = false;
eroe.position.set(PARTENZA.x, 0, PARTENZA.z);

function aggiornaPunteggio() {
  document.getElementById('punteggio').textContent = '💎 ' + stato.gemme + '   ' + '❤️'.repeat(Math.max(stato.vite, 0));
}
aggiornaPunteggio();

function finisci(come) {
  stato.finito = come;
  document.getElementById(come === 'vinto' ? 'vittoria' : 'sconfitta').hidden = false;
  if (come === 'vinto') suono('vittoria');
}

function cadi() {
  stato.vite -= 1;
  suono('caduta');
  aggiornaPunteggio();
  if (stato.vite <= 0) return finisci('perso');
  eroe.position.set(PARTENZA.x, 2, PARTENZA.z);
  velocitaY = 0;
}

function ricomincia() {
  stato.gemme = 0;
  stato.vite = REGOLE.vite;
  stato.finito = null;
  gemme.forEach((g) => g.setEnabled(true));
  eroe.position.set(PARTENZA.x, 0, PARTENZA.z);
  velocitaY = 0;
  document.getElementById('vittoria').hidden = true;
  document.getElementById('sconfitta').hidden = true;
  aggiornaPunteggio();
}
document.querySelectorAll('[data-ricomincia]').forEach((b) => b.addEventListener('click', ricomincia));

// Il ciclo di gioco: succede tante volte al secondo
scena.onBeforeRenderObservable.add(() => {
  stato.fotogrammi += 1;
  const dt = Math.min(motore.getDeltaTime() / 1000, 0.1); // secondi passati dall'ultimo disegno
  gemme.forEach((g) => { g.rotation.y += dt * 2; });
  if (stato.finito) return;

  let dx = 0, dz = 0;
  if (tasti.ArrowLeft || tasti.KeyA) dx -= 1;
  if (tasti.ArrowRight || tasti.KeyD) dx += 1;
  if (tasti.ArrowUp || tasti.KeyW) dz += 1;   // avanti: lontano dalla telecamera
  if (tasti.ArrowDown || tasti.KeyS) dz -= 1; // indietro: verso la telecamera
  if (dx || dz) {
    const lunghezza = Math.hypot(dx, dz);
    eroe.position.x += (dx / lunghezza) * REGOLE.velocita * dt;
    eroe.position.z += (dz / lunghezza) * REGOLE.velocita * dt;
    eroe.rotation.y = Math.atan2(dx, dz);
  }

  if (tasti.Space && aTerra) {
    velocitaY = REGOLE.forzaSalto;
    aTerra = false;
    suono('salto');
  }

  velocitaY -= REGOLE.gravita * dt;
  eroe.position.y += velocitaY * dt;
  const isola = isolaSotto(eroe.position.x, eroe.position.z);
  if (isola && eroe.position.y <= isola.altezza && eroe.position.y > isola.altezza - 1) {
    eroe.position.y = isola.altezza;
    velocitaY = 0;
    aTerra = true;
  } else {
    aTerra = false;
  }
  if (eroe.position.y < -12) cadi();

  gemme.forEach((g) => {
    if (g.isEnabled() && BABYLON.Vector3.Distance(g.position, eroe.position.add(new BABYLON.Vector3(0, 0.6, 0))) < 1.1) {
      g.setEnabled(false);
      stato.gemme += 1;
      suono('gemma');
      aggiornaPunteggio();
      if (stato.gemme >= REGOLE.gemmePerVincere) finisci('vinto');
    }
  });
});

motore.runRenderLoop(() => scena.render());
window.addEventListener('resize', () => motore.resize());

// ---- La porta segreta per il robot collaudatore ----
window.gioco = {
  pronto: false,
  regole: REGOLE,
  stato: () => ({
    gemme: stato.gemme,
    vite: stato.vite,
    finito: stato.finito,
    fotogrammi: stato.fotogrammi,
    eroe: { x: +eroe.position.x.toFixed(2), y: +eroe.position.y.toFixed(2), z: +eroe.position.z.toFixed(2), aTerra },
    gemmeRimaste: gemme.filter((g) => g.isEnabled()).length
  }),
  scorciatoie: {
    vaiA: (x, y, z) => { eroe.position.set(x, y, z); velocitaY = 0; },
    gemme: () => gemme.map((g) => ({ x: g.position.x, y: g.position.y - 0.6, z: g.position.z })),
    ricomincia
  }
};
scena.executeWhenReady(() => { window.gioco.pronto = true; });
