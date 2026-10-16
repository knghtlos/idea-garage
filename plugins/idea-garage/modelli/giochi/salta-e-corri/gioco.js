// =============================================================
//  MODELLO "SALTA E CORRI" (2D, Phaser)
//  Il costruttore parte da qui e lo trasforma nel gioco della carta.
//  Regola d'oro: i numeri che il bambino può voler cambiare stanno
//  tutti in REGOLE, con nomi semplici. Così /migliora è facile e
//  la pagina "Come l'ho fatto" può mostrarli.
// =============================================================

// ---- Le regole del gioco: cambia questi numeri per cambiare il gioco ----
const REGOLE = {
  velocita: 220,          // quanto corre l'eroe
  forzaSalto: 520,        // quanto salta in alto
  gravita: 900,           // quanto forte tira giù la gravità
  stellePerVincere: 10,   // quante stelle servono per vincere
  vite: 3,                // quante volte puoi cadere prima di perdere
  coloreCielo: '#87ceeb'  // il colore dello sfondo
};

// ---- Il mondo: dove stanno le piattaforme (le nuvole) e le stelle ----
const LARGHEZZA = 960;
const ALTEZZA = 540;
const PIATTAFORME = [
  { x: 480, y: 525, larghezza: 960 },   // il pavimento
  { x: 180, y: 410, larghezza: 200 },
  { x: 480, y: 320, larghezza: 200 },
  { x: 780, y: 410, larghezza: 200 },
  { x: 300, y: 220, larghezza: 160 },
  { x: 680, y: 210, larghezza: 160 }
];
const STELLE = [
  { x: 120, y: 360 }, { x: 240, y: 360 }, { x: 430, y: 270 }, { x: 530, y: 270 },
  { x: 720, y: 360 }, { x: 840, y: 360 }, { x: 260, y: 170 }, { x: 340, y: 170 },
  { x: 640, y: 160 }, { x: 720, y: 160 }, { x: 330, y: 470 }, { x: 900, y: 470 }
];
const PARTENZA = { x: 40, y: 440 };  // non sotto una nuvola, se no l'eroe sbatte la testa!

// ---- Suoni fatti con il computer (niente file da scaricare) ----
let audio = null;
function suono(tipo) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const volume = audio.createGain();
    const note = { stella: [660, 990], salto: [300, 520], caduta: [400, 120], vittoria: [523, 1046] }[tipo] || [440, 440];
    osc.type = tipo === 'caduta' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(note[0], audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(note[1], audio.currentTime + 0.15);
    volume.gain.setValueAtTime(0.15, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.25);
    osc.connect(volume).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.25);
  } catch (e) { /* senza audio il gioco funziona lo stesso */ }
}

// ---- Lo stato del gioco: le "scatole" dove teniamo i numeri ----
const stato = { stelle: 0, vite: REGOLE.vite, finito: null, fotogrammi: 0 };
let scena = null;

function aggiornaPunteggio() {
  document.getElementById('punteggio').textContent = '⭐ ' + stato.stelle + '   ' + '❤️'.repeat(Math.max(stato.vite, 0));
}

class Livello extends Phaser.Scene {
  constructor() { super('livello'); }

  preload() {
    this.load.svg('eroe', 'assets/eroe.svg', { width: 56, height: 56 });
  }

  create() {
    scena = this;
    this.cameras.main.setBackgroundColor(REGOLE.coloreCielo);
    this.physics.world.gravity.y = REGOLE.gravita;

    // Disegni fatti con il codice: nuvola e stella
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 100, 26, 13);
    g.generateTexture('nuvola', 100, 26);
    g.clear();
    g.fillStyle(0xffd23f, 1).fillCircle(14, 14, 13);
    g.fillStyle(0xfff3b0, 1).fillCircle(10, 10, 4);
    g.generateTexture('stella', 28, 28);
    g.destroy();

    this.piattaforme = this.physics.add.staticGroup();
    PIATTAFORME.forEach((p) => {
      const nuvola = this.piattaforme.create(p.x, p.y, 'nuvola');
      nuvola.setDisplaySize(p.larghezza, 26).refreshBody();
    });

    this.stelle = this.physics.add.staticGroup();
    STELLE.forEach((s) => this.stelle.create(s.x, s.y, 'stella'));

    this.eroe = this.physics.add.sprite(PARTENZA.x, PARTENZA.y, 'eroe');
    this.eroe.setCollideWorldBounds(false);
    this.physics.add.collider(this.eroe, this.piattaforme);
    this.physics.add.overlap(this.eroe, this.stelle, (eroe, stella) => this.prendiStella(stella));

    this.tasti = this.input.keyboard.createCursorKeys();
    this.tastoSpazio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    aggiornaPunteggio();
    window.gioco.pronto = true;
  }

  prendiStella(stella) {
    stella.disableBody(true, true);
    stato.stelle += 1;
    suono('stella');
    aggiornaPunteggio();
    if (stato.stelle >= REGOLE.stellePerVincere) finisci('vinto');
  }

  update() {
    stato.fotogrammi += 1;
    if (stato.finito) { this.eroe.setVelocity(0, 0); return; }

    const sinistra = this.tasti.left.isDown;
    const destra = this.tasti.right.isDown;
    if (sinistra) { this.eroe.setVelocityX(-REGOLE.velocita); this.eroe.setFlipX(true); }
    else if (destra) { this.eroe.setVelocityX(REGOLE.velocita); this.eroe.setFlipX(false); }
    else this.eroe.setVelocityX(0);

    const vuoleSaltare = this.tasti.up.isDown || this.tastoSpazio.isDown;
    if (vuoleSaltare && this.eroe.body.blocked.down) {
      this.eroe.setVelocityY(-REGOLE.forzaSalto);
      suono('salto');
    }

    // Bordi destro e sinistro: non si esce dallo schermo
    this.eroe.x = Phaser.Math.Clamp(this.eroe.x, 20, LARGHEZZA - 20);

    // Caduta sotto lo schermo: si perde una vita e si riparte
    if (this.eroe.y > ALTEZZA + 60) cadi();
  }
}

function cadi() {
  stato.vite -= 1;
  suono('caduta');
  aggiornaPunteggio();
  if (stato.vite <= 0) return finisci('perso');
  scena.eroe.setPosition(PARTENZA.x, PARTENZA.y).setVelocity(0, 0);
}

function finisci(come) {
  stato.finito = come;
  document.getElementById(come === 'vinto' ? 'vittoria' : 'sconfitta').hidden = false;
  if (come === 'vinto') suono('vittoria');
}

function ricomincia() {
  stato.stelle = 0;
  stato.vite = REGOLE.vite;
  stato.finito = null;
  document.getElementById('vittoria').hidden = true;
  document.getElementById('sconfitta').hidden = true;
  scena.scene.restart();
}
document.querySelectorAll('[data-ricomincia]').forEach((b) => b.addEventListener('click', ricomincia));

// ---- La porta segreta per il robot collaudatore ----
// I test leggono lo stato e usano qualche scorciatoia. Il giocatore non la vede.
window.gioco = {
  pronto: false,
  regole: REGOLE,
  stato: () => ({
    stelle: stato.stelle,
    vite: stato.vite,
    finito: stato.finito,
    fotogrammi: stato.fotogrammi,
    eroe: scena && scena.eroe ? {
      x: Math.round(scena.eroe.x),
      y: Math.round(scena.eroe.y),
      aTerra: scena.eroe.body.blocked.down
    } : null,
    stelleRimaste: scena && scena.stelle ? scena.stelle.countActive(true) : null
  }),
  scorciatoie: {
    vaiA: (x, y) => { scena.eroe.setPosition(x, y).setVelocity(0, 0); },
    stelle: () => STELLE.slice(),
    ricomincia
  }
};

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'contenitore',
  width: LARGHEZZA,
  height: ALTEZZA,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Livello]
});
