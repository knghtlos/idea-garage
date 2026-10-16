// Motore della pagina "Come l'ho fatto". Non modificare a mano.
// - Le parole con <span class="parola" data-termine="libreria">libreria</span>
//   mostrano la spiegazione del glossario passando col mouse o toccandole.
// - I bottoni con data-mostra="id" aprono il pezzo di codice con quell'id.
// - I livelli più profondi (data-livello="2" e "3") si aprono solo se il lettore lo chiede.
(function () {
  const script = document.currentScript;
  const baseMotore = script ? script.src.replace(/come-funziona\.js.*$/, '') : '../../motore/';
  const lingua = (document.documentElement.lang || 'it').startsWith('en') ? 'en' : 'it';
  const TESTI = {
    it: { dipiu: 'Voglio sapere di più 🔍', chiudi: 'Chiudi' },
    en: { dipiu: 'I want to know more 🔍', chiudi: 'Close' }
  };

  let fumetto = null;
  let attiva = null;

  function creaFumetto() {
    fumetto = document.createElement('div');
    fumetto.className = 'fumetto';
    fumetto.id = 'fumetto-glossario';
    fumetto.setAttribute('role', 'tooltip');
    fumetto.hidden = true;
    document.body.appendChild(fumetto);
  }

  function mostra(parola, testo) {
    attiva = parola;
    fumetto.textContent = testo;
    fumetto.hidden = false;
    const r = parola.getBoundingClientRect();
    const larghezza = Math.min(300, window.innerWidth - 32);
    fumetto.style.maxWidth = larghezza + 'px';
    let sinistra = r.left + window.scrollX + r.width / 2 - larghezza / 2;
    sinistra = Math.max(16 + window.scrollX, Math.min(sinistra, window.scrollX + window.innerWidth - larghezza - 16));
    fumetto.style.left = sinistra + 'px';
    fumetto.style.top = (r.bottom + window.scrollY + 10) + 'px';
    parola.setAttribute('aria-describedby', 'fumetto-glossario');
  }

  function nascondi() {
    if (attiva) attiva.removeAttribute('aria-describedby');
    attiva = null;
    if (fumetto) fumetto.hidden = true;
  }

  async function avviaGlossario() {
    let glossario = {};
    try {
      const r = await fetch(baseMotore + 'glossario.json', { cache: 'no-store' });
      glossario = (await r.json())[lingua] || {};
    } catch (e) { /* senza glossario le parole restano normali */ }

    creaFumetto();
    document.querySelectorAll('.parola[data-termine]').forEach((parola) => {
      const chiave = parola.dataset.termine.toLowerCase();
      const testo = glossario[chiave];
      if (!testo) {
        parola.classList.remove('parola');
        parola.dataset.mancante = 'si';
        return;
      }
      parola.tabIndex = 0;
      parola.setAttribute('role', 'button');
      parola.addEventListener('mouseenter', () => mostra(parola, testo));
      parola.addEventListener('mouseleave', nascondi);
      parola.addEventListener('focus', () => mostra(parola, testo));
      parola.addEventListener('blur', nascondi);
      parola.addEventListener('click', (e) => {
        e.stopPropagation();
        if (attiva === parola && !fumetto.hidden) nascondi(); else mostra(parola, testo);
      });
    });
    document.addEventListener('click', nascondi);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') nascondi(); });
  }

  function avviaPezzi() {
    document.querySelectorAll('[data-mostra]').forEach((bottone) => {
      bottone.addEventListener('click', () => {
        const pezzo = document.getElementById(bottone.dataset.mostra);
        if (!pezzo) return;
        if (pezzo.tagName === 'DETAILS') pezzo.open = true;
        pezzo.hidden = false;
        pezzo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        pezzo.classList.add('evidenzia');
        setTimeout(() => pezzo.classList.remove('evidenzia'), 1600);
      });
    });
  }

  function avviaLivelli() {
    const t = TESTI[lingua];
    document.querySelectorAll('[data-livello]').forEach((sezione) => {
      if (sezione.dataset.livello === '1') return;
      sezione.hidden = true;
      const bottone = document.createElement('button');
      bottone.className = 'bottone-livello';
      bottone.type = 'button';
      bottone.textContent = sezione.dataset.invito || t.dipiu;
      bottone.addEventListener('click', () => {
        sezione.hidden = false;
        bottone.remove();
        sezione.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      sezione.parentNode.insertBefore(bottone, sezione);
    });
  }

  avviaLivelli();
  avviaPezzi();
  avviaGlossario();
})();
