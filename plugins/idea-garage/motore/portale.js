// Motore del portale Idea Garage. Non modificare a mano:
// le personalizzazioni vivono in portale.json e tema.css.
(function () {
  const TESTI = {
    it: {
      sottotitolo: (n) => n === 0 ? 'Il mio garage delle idee' : (n === 1 ? '1 creazione' : n + ' creazioni'),
      vuoto: 'Qui arriveranno i tuoi giochi!',
      gioca: 'Gioca',
      apri: 'Apri',
      comeFatto: 'Come l\'ho fatto 🔧',
      nuovo: 'Nuovo!',
      bozza: '🛠️ In costruzione',
      attesa: '⏳ Aspetta il via libera',
      preferito: 'Preferito',
      piede: 'Fatto con Idea Garage'
    },
    en: {
      sottotitolo: (n) => n === 0 ? 'My idea garage' : (n === 1 ? '1 creation' : n + ' creations'),
      vuoto: 'Your games will show up here!',
      gioca: 'Play',
      apri: 'Open',
      comeFatto: 'How I made it 🔧',
      nuovo: 'New!',
      bozza: '🛠️ Being built',
      attesa: '⏳ Waiting for the OK',
      preferito: 'Favourite',
      piede: 'Made with Idea Garage'
    }
  };

  function leggiPreferiti() {
    try { return JSON.parse(localStorage.getItem('idea-garage-preferiti') || '[]'); } catch (e) { return []; }
  }
  function salvaPreferiti(lista) {
    try { localStorage.setItem('idea-garage-preferiti', JSON.stringify(lista)); } catch (e) { /* va bene anche senza */ }
  }

  async function caricaJSON(percorso, ripiego) {
    try {
      const r = await fetch(percorso, { cache: 'no-store' });
      if (!r.ok) return ripiego;
      return await r.json();
    } catch (e) {
      return ripiego;
    }
  }

  function el(tag, attributi, figli) {
    const nodo = document.createElement(tag);
    Object.entries(attributi || {}).forEach(([k, v]) => {
      if (k === 'testo') nodo.textContent = v;
      else if (k.startsWith('on')) nodo.addEventListener(k.slice(2), v);
      else nodo.setAttribute(k, v);
    });
    (figli || []).forEach((f) => f && nodo.appendChild(f));
    return nodo;
  }

  async function avvia() {
    const portale = await caricaJSON('portale.json', {});
    const indice = await caricaJSON('giochi/indice.json', { progetti: [] });
    const lingua = portale.lingua === 'en' ? 'en' : 'it';
    const t = TESTI[lingua];
    document.documentElement.lang = lingua;

    if (portale.colore) document.documentElement.style.setProperty('--colore', portale.colore);
    if (portale.nome) {
      document.getElementById('nome-portale').textContent = portale.nome;
      document.title = portale.nome;
    }
    if (portale.mascotte) document.getElementById('mascotte').textContent = portale.mascotte;
    document.getElementById('piede-testo').textContent = t.piede;

    const progetti = Array.isArray(indice.progetti) ? indice.progetti : [];
    document.getElementById('sottotitolo').textContent = t.sottotitolo(progetti.length);

    const griglia = document.getElementById('griglia');
    if (progetti.length === 0) {
      document.getElementById('vuoto').hidden = false;
      document.getElementById('vuoto-testo').textContent = t.vuoto;
      return;
    }

    const preferiti = leggiPreferiti();
    const ordinati = progetti.slice().sort((a, b) => {
      const pa = preferiti.includes(a.slug) ? 1 : 0;
      const pb = preferiti.includes(b.slug) ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return String(b.aggiornato || '').localeCompare(String(a.aggiornato || ''));
    });
    // "Nuovo!" va sull'ultimo progetto pubblicato
    const piuRecente = progetti.filter((p) => p.stato === 'pubblicato')
      .sort((a, b) => String(b.aggiornato || '').localeCompare(String(a.aggiornato || '')))[0];

    ordinati.forEach((p) => {
      const base = 'giochi/' + encodeURIComponent(p.slug) + '/';
      const copertina = p.copertina
        ? el('img', { src: base + p.copertina, alt: '' })
        : document.createTextNode(p.emoji || '🎮');

      let etichetta = null;
      if (p.stato === 'bozza') etichetta = el('span', { class: 'etichetta bozza', testo: t.bozza });
      else if (p.stato === 'in-attesa') etichetta = el('span', { class: 'etichetta attesa', testo: t.attesa });
      else if (piuRecente && p.slug === piuRecente.slug) etichetta = el('span', { class: 'etichetta', testo: t.nuovo });

      const premuto = preferiti.includes(p.slug);
      const stella = el('button', {
        class: 'stella',
        'aria-pressed': String(premuto),
        'aria-label': t.preferito,
        title: t.preferito,
        testo: '⭐',
        onclick: (ev) => {
          const lista = leggiPreferiti();
          const i = lista.indexOf(p.slug);
          if (i >= 0) lista.splice(i, 1); else lista.push(p.slug);
          salvaPreferiti(lista);
          ev.currentTarget.setAttribute('aria-pressed', String(i < 0));
        }
      });

      const azioni = el('div', { class: 'azioni' }, [
        el('a', { class: 'bottone', href: base, testo: p.tipo === 'app' ? t.apri : t.gioca }),
        p.comeFunziona ? el('a', { class: 'bottone secondario', href: base + 'come-e-fatto.html', testo: t.comeFatto }) : null
      ]);

      griglia.appendChild(el('article', { class: 'scheda' }, [
        el('div', { class: 'copertina' }, [copertina]),
        etichetta,
        stella,
        el('div', { class: 'scheda-corpo' }, [
          el('h2', { testo: p.titolo || p.slug }),
          p.descrizione ? el('p', { testo: p.descrizione }) : null,
          azioni
        ])
      ]));
    });
  }

  avvia();
})();
