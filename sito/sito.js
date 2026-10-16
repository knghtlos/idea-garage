// La vetrina di Idea Garage: lingua (italiano/inglese) e galleria dei giochi da giochi.json
(function () {
  const TESTI = {
    it: {
      salta: 'Vai al contenuto',
      titolo: 'Racconta un\'idea. Gioca il tuo gioco.',
      sotto: 'Un bambino di 8 anni descrive il gioco che ha in testa. Claude fa qualche domanda, prepara la carta del gioco, lo costruisce e lo fa provare a un robot. Pochi minuti dopo, il bambino ci gioca.',
      provaUnGioco: 'Prova un gioco',
      perIGrandi: 'Per i grandi: come si installa',
      cartaTipo: 'Carta del gioco',
      cartaTitolo: 'Saltanuvole',
      cartaFrase: '«Un mostriciattolo che salta sulle nuvole e prende le stelle!»',
      regola1: 'Premi la freccia su e salta.',
      regola2: 'Prendi 10 stelle per vincere.',
      regola3: 'Se cadi giù, perdi una vita.',
      gioca: 'Gioca',
      postit: 'Il robot collaudatore ha controllato ogni regola della carta ✓',
      comeTitolo: 'Come nasce un gioco',
      s1t: 'Racconti l\'idea', s1p: 'Anche una frase sola, scritta o detta a voce.',
      s2t: 'Il detective fa qualche domanda', s2p: 'Una alla volta, con risposte da scegliere. Chi è l\'eroe? Come si vince?',
      s3t: 'Approvi la carta del gioco', s3p: 'Regole in poche frasi e l\'eroe già disegnato. Ti piace? Allora si parte.',
      s4t: 'Claude costruisce', s4p: 'Ogni regola della carta diventa una prova automatica, poi il gioco.',
      s5t: 'Il robot lo prova', s5p: 'Gioca da solo e controlla che il gioco faccia quello che hai chiesto.',
      s6t: 'Giochi e lo fai crescere', s6p: '"Voglio i nemici!" e si ricomincia dal giro piccolo.',
      giochiTitolo: 'I giochi',
      giochiSotto: 'Giocabili qui, nel browser. Per ora ci sono i due esempi che il plugin usa come punto di partenza.',
      carta: 'La carta',
      comeFatto: 'Come l\'ho fatto',
      liberoTitolo: 'Il prossimo può essere il tuo',
      liberoP: 'Crea un gioco con Idea Garage, esportalo con /esporta e aggiungilo qui. Le istruzioni sono qui sotto, nella parte per i grandi.',
      grandiTitolo: 'Per i grandi',
      installaTitolo: 'Cosa serve',
      installaP: 'Claude Code, Node.js 18 o più recente e git. Poi, in Claude Code:',
      installaP2: 'In una cartella vuota scrivi <code>/idea-garage:start</code>. La prima volta accetta la domanda "ti fidi di questa cartella?".',
      sicuroTitolo: 'Sicuro per un bambino',
      sicuroP: 'Una guardia impedisce di lavorare fuori dal garage, scaricare cose da internet o cancellare i giochi. Il bambino non vede richieste tecniche e niente esce dal computer senza un adulto.',
      doveTitolo: 'Dove finiscono i giochi',
      doveP: 'Restano sul computer, nella pagina "il mio garage". Se vuoi, <code>/esporta</code> crea uno zip da caricare su un sito, e <code>/pubblica</code> li mette su internet con il tuo via libera.',
      aggiungiTitolo: 'Aggiungere un gioco a questa vetrina',
      aggiungiP: 'Esporta il gioco con <code>/esporta</code>, poi dalla cartella di questo repository:',
      aggiungiP2: 'Usa un nickname, mai nome e cognome.',
      piede: 'Idea Garage è un plugin per Claude Code, con licenza MIT.'
    },
    en: {
      salta: 'Skip to content',
      titolo: 'Tell an idea. Play your game.',
      sotto: 'An 8-year-old describes the game in their head. Claude asks a few questions, makes the game card, builds it and has a robot test it. A few minutes later, the child is playing it.',
      provaUnGioco: 'Try a game',
      perIGrandi: 'For grown-ups: how to install',
      cartaTipo: 'Game card',
      cartaTitolo: 'Cloud Hopper',
      cartaFrase: '“A little monster that hops on clouds and collects stars!”',
      regola1: 'Press the up arrow to jump.',
      regola2: 'Collect 10 stars to win.',
      regola3: 'Fall off and you lose a life.',
      gioca: 'Play',
      postit: 'The test robot checked every rule on the card ✓',
      comeTitolo: 'How a game is born',
      s1t: 'You tell the idea', s1p: 'Even a single sentence, typed or spoken.',
      s2t: 'The detective asks a few questions', s2p: 'One at a time, with answers to pick. Who is the hero? How do you win?',
      s3t: 'You approve the game card', s3p: 'The rules in a few sentences and the hero already drawn. Like it? Off we go.',
      s4t: 'Claude builds it', s4p: 'Every rule on the card becomes an automatic check, then the game.',
      s5t: 'The robot tests it', s5p: 'It plays by itself and checks the game does what you asked.',
      s6t: 'You play and make it grow', s6p: '"I want enemies!" and the small loop starts again.',
      giochiTitolo: 'The games',
      giochiSotto: 'Playable right here, in the browser. For now these are the two examples the plugin starts from.',
      carta: 'The card',
      comeFatto: 'How I made it',
      liberoTitolo: 'The next one could be yours',
      liberoP: 'Make a game with Idea Garage, export it with /export-game and add it here. Instructions are below, in the grown-ups section.',
      grandiTitolo: 'For grown-ups',
      installaTitolo: 'What you need',
      installaP: 'Claude Code, Node.js 18 or newer and git. Then, in Claude Code:',
      installaP2: 'In an empty folder type <code>/idea-garage:start</code>. The first time, accept the "trust this folder?" question.',
      sicuroTitolo: 'Safe for a child',
      sicuroP: 'A guard stops work outside the garage, downloads from the internet and deleting games. The child never sees technical prompts, and nothing leaves the computer without a grown-up.',
      doveTitolo: 'Where the games go',
      doveP: 'They stay on the computer, in the "my garage" page. If you want, <code>/export-game</code> makes a zip to upload to a website, and <code>/publish</code> puts them online with your OK.',
      aggiungiTitolo: 'Adding a game to this showcase',
      aggiungiP: 'Export the game with <code>/export-game</code>, then from this repository folder:',
      aggiungiP2: 'Use a nickname, never a full name.',
      piede: 'Idea Garage is a plugin for Claude Code, MIT licensed.'
    }
  };

  let lingua = 'it';
  try { lingua = localStorage.getItem('idea-garage-lingua') || ''; } catch (e) { lingua = ''; }
  if (lingua !== 'it' && lingua !== 'en') lingua = (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en';

  let giochi = [];

  function testoPer(campo) {
    if (campo == null) return '';
    if (typeof campo === 'string') return campo;
    return campo[lingua] || campo.it || campo.en || '';
  }

  function el(tag, attributi, figli) {
    const nodo = document.createElement(tag);
    Object.entries(attributi || {}).forEach(([k, v]) => {
      if (k === 'testo') nodo.textContent = v; else nodo.setAttribute(k, v);
    });
    (figli || []).forEach((f) => f && nodo.appendChild(f));
    return nodo;
  }

  function disegnaGalleria() {
    const t = TESTI[lingua];
    const griglia = document.getElementById('griglia');
    griglia.textContent = '';
    giochi.forEach((g) => {
      const base = 'giochi/' + encodeURIComponent(g.slug) + '/';
      const titolo = testoPer(g.titolo);
      griglia.appendChild(el('article', { class: 'gioco' }, [
        el('img', { src: base + 'copertina.png', alt: titolo, loading: 'lazy', width: '640', height: '360' }),
        el('div', { class: 'gioco-corpo' }, [
          el('h3', { testo: titolo }),
          el('p', { class: 'autore', testo: testoPer(g.autore) }),
          el('p', { class: 'descrizione', testo: testoPer(g.descrizione) }),
          g.tasti ? el('p', { class: 'tasti', testo: '⌨️ ' + testoPer(g.tasti) }) : null,
          el('div', { class: 'azioni' }, [
            el('a', { class: 'bottone piccolo', href: base, testo: t.gioca }),
            g.carta ? el('a', { class: 'collegamento', href: base + 'carta.html', testo: t.carta }) : null,
            g.comeFatto ? el('a', { class: 'collegamento', href: base + 'come-e-fatto.html', testo: t.comeFatto }) : null
          ])
        ])
      ]));
    });
    griglia.appendChild(el('div', { class: 'posto-libero' }, [
      el('h3', { testo: t.liberoTitolo }),
      el('p', { testo: t.liberoP })
    ]));
  }

  function applicaLingua(nuova) {
    lingua = nuova;
    try { localStorage.setItem('idea-garage-lingua', lingua); } catch (e) { /* va bene anche senza */ }
    document.documentElement.lang = lingua;
    const t = TESTI[lingua];
    document.querySelectorAll('[data-t]').forEach((nodo) => {
      const valore = t[nodo.dataset.t];
      if (valore == null) return;
      if (valore.includes('<code>')) nodo.innerHTML = valore; else nodo.textContent = valore;
    });
    document.querySelectorAll('[data-lingua]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lingua === lingua)));
    disegnaGalleria();
  }

  document.querySelectorAll('[data-lingua]').forEach((b) => b.addEventListener('click', () => applicaLingua(b.dataset.lingua)));

  fetch('giochi.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then((dati) => { giochi = Array.isArray(dati.giochi) ? dati.giochi : []; })
    .catch(() => { giochi = []; })
    .finally(() => applicaLingua(lingua));
})();
