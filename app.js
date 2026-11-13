(() => {
  'use strict';
  // Indirizzo pubblico del sito: usato quando la pagina gira in un'anteprima senza URL proprio.
  const SITE_URL = 'https://ai-lineamento.pages.dev/';
  const LIMITS = { up: 300, down: 400 };
  const MIN_VOTES = 2;

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const newSeed = () => Math.floor(Math.random() * 4294967296) >>> 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage non disponibile */ } }
  };
  const A = window.Aziendalese;
  const VOC = window.VOCAB || [];

  const form = $('#composer'), source = $('#source'), count = $('#count'), error = $('#error'), submit = $('#submit');
  const processCard = $('#process'), post = $('#post'), human = $('#human');
  let dir = 'up';
  let state = { original: '', result: null };
  let api = false;
  const community = new Map(); // frase normalizzata -> {p, s, t, n}
  let busy = false, skipAnim = false;

  /* ---------- direzione e input ---------- */
  const EXAMPLES = {
    up: [['Faccio fotocopie', 'Mi occupo di fare fotocopie.'], ['Poteva essere una mail', 'Questa riunione poteva essere una mail.'], ['Non ho tempo', 'Non ho tempo.'], ['Vado al caffè', 'Vado a prendere un caffè.'], ['Prenoto la sala', 'Prenoto la sala riunioni per domani.'], ['Ho sbagliato', 'Ho sbagliato.']],
    down: [['La mail del capo', 'Ciao Marco, FYI ti forwardo la mail: checkala ASAP e dammi un feedback entro EOD.'], ['La call di allineamento', 'Scheduliamo una call di allineamento per fare un deep dive sui KPI.'], ['Il collega senza tempo', 'Al momento non ho bandwidth, pingami offline e ci allineiamo ASAP.'], ['Il brainstorming', 'Facciamo un brainstorming out of the box per fixare il bottleneck.'], ['L’escalation', 'Escaliamo al decision maker: serve una helicopter view sul budget.']]
  };
  function setDir(d, keepText = false) {
    dir = d;
    $('#out').hidden = true;
    form.classList.toggle('down', d === 'down');
    $$('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.dir === d)));
    source.maxLength = LIMITS[d];
    $('#composer-label').textContent = d === 'up' ? 'Cosa vuoi dire, in parole semplici?' : 'Incolla l’aziendalese che hai ricevuto';
    source.placeholder = d === 'up' ? 'Es. Mi occupo di fare fotocopie.' : 'Es. Ti forwardo il deck, checkalo ASAP e allineiamoci entro EOD.';
    $('#hint').textContent = d === 'up' ? 'Fino a 300 caratteri, come un messaggio. Evita nomi e dati riservati.' : 'Fino a 400 caratteri: una mail, un messaggio, un post. Togliamo la fuffa.';
    submit.textContent = d === 'up' ? 'Traduci in aziendalese' : 'Traduci in italiano';
    const ex = $('#examples');
    ex.replaceChildren(Object.assign(document.createElement('span'), { textContent: 'Prova con:' }), ...EXAMPLES[d].map(([label, text]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = label;
      b.addEventListener('click', () => { source.value = text; updateCount(); source.focus(); });
      return b;
    }));
    if (!keepText) source.value = '';
    updateCount();
  }
  $$('.tab').forEach(t => t.addEventListener('click', () => { if (!busy) setDir(t.dataset.dir); }));

  function updateCount() {
    const n = [...source.value].length, max = LIMITS[dir];
    count.textContent = `${n} / ${max}`;
    count.classList.toggle('warn', n >= max - 30 && n < max);
    count.classList.toggle('full', n >= max);
    showError('');
  }
  function showError(msg) {
    error.textContent = msg;
    error.hidden = !msg;
    if (msg) source.setAttribute('aria-invalid', 'true'); else source.removeAttribute('aria-invalid');
  }
  function oneSentence(text) {
    const t = text.replace(/\b(?:sig|dott|ing|avv|prof|ecc|es|n)\./gi, m => m.slice(0, -1)).replace(/\.{3}|…/g, '…');
    return !/[.!?…]+\s*\p{L}/u.test(t.replace(/\b[A-Z]\.(?=[A-Z])/g, ''));
  }
  source.addEventListener('input', updateCount);
  source.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); form.requestSubmit(); }
  });

  /* ---------- animazione: il viaggio della frase ---------- */
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const short = (s, n) => [...s].length > n ? [...s].slice(0, n).join('').trim() + '…' : s;
  const TILE = ['#6b5bd2', '#e8457c', '#f97316', '#1f9d55', '#0ea5c6', '#2f6fde'];
  const SCENES = {
    chat: p => ({
      title: 'Teams · Chat con ' + pickOne(['il tuo manager', 'Ufficio Acquisti', 'Marketing', 'il gruppo «Allineamento Q4»', 'HR']),
      html: `<div class="bubble"><small>${esc(pickOne(['Giulia', 'Marco', 'Il tuo manager', 'Federica', 'Luca']))} · 09:01</small>${esc(pickOne(['Ti rubo due minuti?', 'Ci sei?', 'Hai visto la mia mail?', 'Possiamo sentirci al volo?', 'Una cosa veloce veloce']))}</div>
             <div class="bubble me"><small>Tu · 09:02</small>${esc(short(p, 70))}</div>
             <div class="bubble"><span class="typing"><span></span><span></span><span></span></span></div>`
    }),
    doc: p => {
      const words = p.split(' ');
      const cut = Math.min(3, words.length);
      return {
        title: `Frase_v${2 + Math.floor(Math.random() * 9)}_DEFINITIVA${pickOne(['_ok', '_rev2', '_DAVVERO', ' (1)', '_finale_finale'])}.docx`,
        html: `<div class="page"><span class="comment">${esc(pickOne(['Rendiamolo più strategico?', 'Manca un po’ di visione', 'Serve più ownership', 'Aggiungerei una buzzword']))}</span>
               <del>${esc(words.slice(0, cut).join(' '))}</del> <ins>${esc(pickOne(['In ottica sinergica', 'A tendere', 'End-to-end', 'Con ownership', 'Lato stakeholder']))}</ins> ${esc(short(words.slice(cut).join(' '), 60))}</div>`
      };
    },
    mail: p => ({
      title: 'Posta in arrivo · 1.284 non letti',
      html: `<div><div class="mail-row"><b>A:</b> Tutti (${30 + Math.floor(Math.random() * 60)})</div>
             <div class="mail-row"><b>Cc:</b> ${esc(pickOne(['Il mondo', 'Chiunque abbia mai lavorato qui', 'Management, per visibilità', 'Il capo del capo']))}</div>
             <div class="mail-row"><b>Ogg.:</b> RE: RE: FW: ${esc(short(p, 42))}</div>
             <span class="reply-all">Rispondi a tutti</span></div>`
    }),
    sheet: p => ({
      title: 'KPI_frasi_2026_v3.xlsx · Foglio1',
      html: `<div class="grid">
        <div class="h"></div><div class="h">A</div><div class="h">B</div><div class="h">C</div><div class="h">D</div>
        <div class="h">1</div><div><b>Frase</b></div><div><b>Impatto</b></div><div><b>KPI</b></div><div><b>Owner</b></div>
        <div class="h">2</div><div>${esc(short(p, 18))}</div><div>${pickOne(['Alto', 'Strategico', 'Molto alto'])}</div><div class="err">#RIF!</div><div>TBD</div>
        <div class="h">3</div><div>Sinergie</div><div>+300%</div><div>${pickOne(['🟢', '🟡', '🚀'])}</div><div>Tutti</div>
      </div>`
    }),
    meet: () => {
      const people = ['Tu', 'GM', 'HR', 'IT', 'MK', '??'];
      const talk = 1 + Math.floor(Math.random() * 5);
      return {
        title: pickOne(['Pre-allineamento sull’allineamento', 'Sync settimanale (spostato 3 volte)', 'Call veloce · 60 min', 'Kick-off del kick-off']),
        html: `<div class="tiles">${people.map((x, i) => `<div class="tile${i === talk ? ' talk' : ''}" style="--tc:${TILE[i]}">${x}<small>${i === 0 ? 'Tu (in muto)' : pickOne(['camera off', 'connesso', 'in auto', 'in coda'])}</small></div>`).join('')}</div>
               <div class="caption">${esc(pickOne(['«Mi sentite?»', '«Sei in muto»', '«Vedete il mio schermo?»', '«Facciamo un giro di tavolo»', '«Lascio due minuti di buffer»', '«Ci aggiorniamo offline»']))}</div>`
      };
    }
  };
  const ORDER = ['chat', 'doc', 'mail', 'sheet', 'meet'];

  async function runAnimation(phrase, reverse = false) {
    if (reduced.matches) return;
    skipAnim = false;
    processCard.hidden = false;
    processCard.classList.toggle('reverse', reverse);
    $('#process-title').textContent = reverse ? 'Sto togliendo la fuffa, un’app alla volta' : 'La tua frase è in giro per l’azienda';
    processCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const items = $$('#stations li');
    const order = reverse ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
    items.forEach(li => li.classList.remove('hit', 'done'));
    const token = $('#token'), fill = $('#track-fill');
    token.style.transition = 'none';
    token.style.left = (order[0] * 20 + 10) + '%';
    void token.offsetWidth;
    token.style.transition = '';
    fill.style.width = '0';
    for (const [step, i] of order.entries()) {
      if (skipAnim) break;
      const li = items[i];
      const scene = SCENES[ORDER[i]](phrase);
      token.style.left = (i * 20 + 10) + '%';
      fill.style.width = (step / 4 * 100) + '%';
      $('#window-bar').style.setProperty('--wc', getComputedStyle(li).getPropertyValue('--c'));
      $('#window-title').textContent = scene.title;
      const body = $('#window-body');
      body.innerHTML = scene.html;
      body.classList.remove('enter'); void body.offsetWidth; body.classList.add('enter');
      items.forEach(x => x.classList.remove('hit'));
      li.classList.add('hit');
      order.slice(0, step).forEach(j => items[j].classList.add('done'));
      await delay(reverse ? 520 : (step === 4 ? 1000 : 780));
    }
    processCard.hidden = true;
  }
  $('#skip').addEventListener('click', () => { skipAnim = true; });

  /* ---------- risultato: il palco ---------- */
  function confetti() {
    if (reduced.matches) return;
    const box = $('#confetti');
    const colors = ['#ffcf4a', '#e8457c', '#6b5bd2', '#0ea5c6', '#1f9d55', '#f97316', '#ffffff'];
    box.replaceChildren(...Array.from({ length: 42 }, () => {
      const i = document.createElement('i');
      const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 220;
      i.style.cssText = `--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d * .6 - 40}px;--r:${Math.random() * 720 - 360}deg;--cc:${pickOne(colors)};--d:${Math.random() * 180}ms`;
      return i;
    }));
    setTimeout(() => box.replaceChildren(), 1600);
  }
  function renderAfter(segments) {
    const after = $('#after-text');
    const nodes = [];
    let idx = 0;
    const total = segments.reduce((n, s) => n + (s.hl ? 1 : s.t.split(/\s+/).length), 0);
    const step = Math.min(45, 1500 / Math.max(1, total));
    for (const s of segments) {
      if (s.hl) {
        const m = document.createElement('mark');
        m.className = 'w'; m.textContent = s.t; m.style.animationDelay = (idx++ * step) + 'ms';
        nodes.push(m);
      } else {
        for (const part of s.t.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { nodes.push(document.createTextNode(part)); continue; }
          const w = document.createElement('span');
          w.className = 'w'; w.textContent = part; w.style.animationDelay = (idx++ * step) + 'ms';
          nodes.push(w);
        }
      }
    }
    after.replaceChildren(...nodes);
  }
  function showOut(label, segments) {
    $('#out-label').textContent = label;
    $('#out-text').replaceChildren(...segments.map(s => {
      if (!s.hl) return document.createTextNode(s.t);
      const m = document.createElement('mark'); m.textContent = s.t; return m;
    }));
    const out = $('#out');
    out.hidden = false;
    out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';
  }
  $('#out-copy').addEventListener('click', async () => {
    if (await copyText($('#out-text').textContent)) toast('Copiato.');
  });
  function render(res, original, info = {}) {
    human.hidden = true;
    showOut('In aziendalese', res.segments);
    $('#before-text').textContent = original;
    renderAfter(res.segments);
    $('#post-title').textContent = res.title;
    const cb = $('#community-badge');
    cb.hidden = !info.community;
    if (info.community) cb.textContent = `🏆 Versione scelta dalla community · ${info.community.n} voti`;
    $('#meter-value').textContent = res.score + '%';
    const fill = $('#meter-fill');
    fill.style.width = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = res.score + '%'; }));
    const n = 40 + Math.floor(res.score * (3 + Math.random() * 4));
    $('#reactions-count').textContent = `${n} stakeholder e ${Math.max(2, Math.floor(n / 9))} decision maker`;
    post.hidden = false;
    confetti();
    renderVote();
  }

  function translateNow(phrase, seed) {
    const c = community.get(A.norm(phrase));
    let res, info = {};
    if (seed == null && c) {
      res = A.translate(phrase, 'board', { seed: c.s });
      if (res.text !== c.t) res = Object.assign({}, res, { text: c.t, segments: [{ t: c.t }] });
      info.community = c;
    } else {
      res = A.translate(phrase, 'board', { seed: seed ?? newSeed() });
    }
    state = { original: phrase, result: res };
    render(res, phrase, info);
    return res;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const phrase = source.value.replace(/\s+/g, ' ').trim();
    if (!/\p{L}/u.test(phrase)) return showError(dir === 'up' ? 'Scrivi una frase da tradurre.' : 'Incolla un testo in aziendalese.');
    if ([...phrase].length > LIMITS[dir]) return showError(`Accorcia il testo: massimo ${LIMITS[dir]} caratteri.`);
    showError('');
    busy = true; submit.disabled = true;
    $('#shared-banner').hidden = true;
    post.hidden = true; human.hidden = true; $('#out').hidden = true;
    processCard.after(post); post.after(human);
    if (dir === 'up') {
      await runAnimation(phrase);
      translateNow(phrase);
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      const c = store.get('at-count', 0) + 1; store.set('at-count', c); $('#stat-count').textContent = c;
      $('#out').scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
    } else {
      await runAnimation(phrase, true);
      renderHuman(phrase);
      $('#out').scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
    }
    busy = false; submit.disabled = false;
  });

  $('#again').addEventListener('click', () => {
    if (!state.original) return;
    let res;
    for (let i = 0; i < 10; i++) {
      const s = newSeed();
      res = A.translate(state.original, 'board', { seed: s });
      if (res.text !== state.result.text) break;
    }
    state.result = res;
    render(res, state.original);
    $('#out').scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
    toast('Nuova versione, stesso contenuto. Come in riunione.');
  });
  $('#copy').addEventListener('click', async () => {
    if (state.result && await copyText(state.result.text)) toast('Copiato. Ora incollalo dove fa più scena.');
  });
  $('#roundtrip').addEventListener('click', async () => {
    if (!state.result || busy) return;
    setDir('down', true);
    source.value = [...state.result.text].slice(0, LIMITS.down).join('');
    updateCount();
    form.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'auto' : 'smooth' });
    await delay(350);
    form.requestSubmit();
  });

  /* ---------- traduttore inverso ---------- */
  let lastHuman = null;
  function renderHuman(text) {
    const r = A.humanize(text, VOC);
    lastHuman = r;
    $('#human-before').textContent = text;
    $('#human-text').textContent = r.text;
    showOut('In italiano umano', [{ t: r.text }]);
    $('#fluff').textContent = r.removed > 0 ? `Fuffa rimossa: ${r.removed}%` : `${r.decoded.length} parole decifrate`;
    $('#decoded').replaceChildren(...r.decoded.map(d => {
      const li = document.createElement('li');
      li.append(Object.assign(document.createElement('s'), { textContent: d.from }), ' → ', Object.assign(document.createElement('b'), { textContent: d.to }));
      return li;
    }));
    human.hidden = false;
    const f = store.get('at-fluff', 0) + r.decoded.length; store.set('at-fluff', f); $('#stat-fluff').textContent = f;
  }
  $('#human-copy').addEventListener('click', async () => { if (lastHuman && await copyText(lastHuman.text)) toast('Copiato in italiano umano.'); });
  $('#human-share').addEventListener('click', () => openShare(true));

  /* ---------- voti della community ---------- */
  function renderVote() {
    const box = $('#vote');
    if (!api || !state.result) { box.hidden = true; return; }
    const options = [{ s: state.result.seed, t: state.result.text }];
    for (let i = 0; i < 20 && options.length < 3; i++) {
      const s = newSeed();
      const r = A.translate(state.original, 'board', { seed: s });
      if (!options.some(o => o.t === r.text)) options.push({ s, t: r.text });
    }
    const voted = store.get('at-voted', {})[A.norm(state.original)];
    $('#vote-status').textContent = voted ? 'Hai già votato questa frase. Grazie!' : '';
    $('#vote-options').replaceChildren(...options.map((o, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<b></b><span></span>';
      b.querySelector('b').textContent = String.fromCharCode(65 + i);
      b.querySelector('span').textContent = o.t;
      b.disabled = !!voted;
      b.addEventListener('click', () => vote(o, b));
      return b;
    }));
    box.hidden = false;
  }
  async function vote(option, btn) {
    $$('#vote-options button').forEach(b => { b.disabled = true; });
    btn.classList.add('chosen');
    const status = $('#vote-status');
    status.textContent = 'Invio del voto…';
    try {
      const r = await fetch('/api/vote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ p: state.original, s: option.s }) });
      const data = await r.json().catch(() => ({}));
      const voted = store.get('at-voted', {}); voted[A.norm(state.original)] = option.s; store.set('at-voted', voted);
      if (r.ok) {
        status.textContent = data.n >= MIN_VOTES ? `Voto registrato: ${data.n} voti. Questa versione è entrata nel motore! 🏆` : `Voto registrato. Con un altro voto entra nel motore.`;
        state.result = A.translate(state.original, 'board', { seed: option.s });
        $('#before-text').textContent = state.original;
        renderAfter(state.result.segments);
        showOut('In aziendalese', state.result.segments);
        confetti();
        loadCommunity(false);
      } else if (r.status === 409) status.textContent = 'Hai già votato questa frase. Una volta basta, anche in azienda.';
      else status.textContent = 'Questa frase non può essere votata.';
    } catch {
      status.textContent = 'Votazioni non disponibili in questo momento.';
    }
  }
  async function loadCommunity(rerender = true) {
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch('/api/top', { signal: ctrl.signal, cache: 'no-store' });
      if (!r.ok) throw new Error('no api');
      const data = await r.json();
      if (!Array.isArray(data.items)) throw new Error('bad');
      api = true;
      community.clear();
      for (const it of data.items) {
        if (typeof it.p !== 'string' || typeof it.t !== 'string') continue;
        const k = A.norm(it.p);
        if (!community.has(k) || community.get(k).n < it.n) community.set(k, it);
      }
      const top = [...community.values()].sort((a, b) => b.n - a.n).slice(0, 5);
      $('#community').hidden = !top.length;
      $('#community-list').replaceChildren(...top.map(it => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.innerHTML = '<b></b><small></small> <span></span>';
        b.querySelector('b').textContent = '«' + it.p + '»';
        b.querySelector('small').textContent = short(it.t, 70);
        b.querySelector('span').textContent = `${it.n} voti`;
        b.addEventListener('click', () => { setDir('up'); processCard.after(post); translateNow(it.p); post.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
        li.append(b); return li;
      }));
      if (rerender && state.result && !post.hidden) renderVote();
    } catch { api = false; }
  }

  /* ---------- condivisione ---------- */
  const b64 = {
    enc: s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)))
  };
  function appUrl() {
    if (!/^https?:$/.test(location.protocol) || /claude|anthropic|localhost|127\.0\.0\.1/.test(location.hostname)) return SITE_URL;
    return location.origin + location.pathname;
  }
  function resultUrl() {
    const r = state.result;
    const payload = { o: state.original, s: r.score, j: r.title, g: r.segments.map(x => [x.t, x.hl ? 1 : 0]) };
    return appUrl() + '#r=' + b64.enc(JSON.stringify(payload));
  }
  const dialog = $('#share-dialog');
  const what = () => (state.result && dialog.querySelector('[name="what"]:checked').value === 'result') ? 'result' : 'app';
  const link = () => what() === 'result' ? resultUrl() : appUrl();
  const TAGS = '#AILineamento #aziendalese #ufficio #ironia #lavoro';
  function postText() {
    if (what() === 'result') {
      const r = state.result;
      return [
        'Ho passato una frase dall’AI-Lineamento: ecco la versione in aziendalese da keynote 🎤',
        `Prima: «${state.original}»\nDopo: «${r.text}»`,
        `Indice di aziendalese: ${r.score}%.`,
        `Il mio risultato: ${resultUrl()}\nProvalo anche tu (funziona anche al contrario): ${appUrl()}`,
        `È un esperimento satirico, giusto per sdrammatizzare un po' la vita d'ufficio.\n${TAGS}`
      ].join('\n\n');
    }
    return [
      'Si chiama AI-Lineamento ed è un traduttore dall’italiano all’aziendalese. Scrivi «faccio fotocopie» e ti risponde con un discorso da keynote. Funziona anche al contrario: incolli la mail piena di ASAP e deep dive, e ti dice cosa volevano dire davvero.',
      `Provalo: ${appUrl()}`,
      `È un esperimento satirico, giusto per sdrammatizzare un po' la vita d'ufficio.\n${TAGS}`
    ].join('\n\n');
  }
  function refreshShare() {
    dialog.querySelector('[value="result"]').disabled = !state.result || dialog.dataset.appOnly === '1';
    $('#share-note').textContent = what() === 'result'
      ? 'Chi apre il link vede la tua frase e la traduzione: niente nomi, clienti o dati riservati. LinkedIn e Facebook mostrano l’anteprima del sito: il testo con il prima e il dopo lo copiamo noi, tu lo incolli nel post.'
      : 'Condividi solo il link al traduttore, senza la tua frase.';
    $('#post-preview').value = postText();
    $('#download-img').disabled = what() !== 'result';
    $('#share-feedback').textContent = '';
  }
  function openShare(appOnly = false) {
    dialog.dataset.appOnly = appOnly ? '1' : '0';
    $('#native-share').hidden = typeof navigator.share !== 'function';
    dialog.querySelector(`[value="${state.result && !appOnly ? 'result' : 'app'}"]`).checked = true;
    refreshShare();
    dialog.showModal();
  }
  $('#share').addEventListener('click', () => openShare(false));
  dialog.addEventListener('change', refreshShare);

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      (document.querySelector('dialog[open]') || document.body).append(ta);
      ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }
  const feedback = msg => { $('#share-feedback').textContent = msg; };
  const open = url => window.open(url, '_blank', 'noopener,noreferrer');
  const E = encodeURIComponent;

  $('#copy-post').addEventListener('click', async () => feedback(await copyText(postText()) ? 'Testo del post copiato.' : 'Copia non riuscita: seleziona il testo nell’anteprima qui sotto.'));
  $('#copy-link').addEventListener('click', async () => feedback(await copyText(link()) ? 'Link copiato.' : 'Copia non riuscita.'));
  $('#download-img').addEventListener('click', async () => { await downloadImage(); feedback('Immagine scaricata.'); });

  $$('.net').forEach(btn => btn.addEventListener('click', async () => {
    const net = btn.dataset.net, url = link(), text = postText();
    if (net === 'linkedin') {
      const ok = await copyText(text);
      open('https://www.linkedin.com/sharing/share-offsite/?url=' + E(url));
      feedback(ok ? 'Testo copiato: incollalo nel post di LinkedIn.' : 'Apri LinkedIn e incolla il testo dall’anteprima.');
    } else if (net === 'facebook') {
      const ok = await copyText(text);
      open('https://www.facebook.com/sharer/sharer.php?u=' + E(url));
      feedback(ok ? 'Testo copiato: incollalo nel post di Facebook.' : 'Incolla il testo dall’anteprima qui sotto.');
    } else if (net === 'teams') {
      const msg = what() === 'result' ? `Prima: «${state.original}»\nDopo: «${state.result.text}»` : 'Traduttore satirico in aziendalese';
      open('https://teams.microsoft.com/share?href=' + E(url) + '&msgText=' + E(msg));
      feedback('Si apre Teams: scegli la chat o il canale.');
    } else if (net === 'whatsapp') {
      open('https://wa.me/?text=' + E(text));
    } else if (net === 'instagram') {
      await shareInstagram(text);
    } else if (net === 'native') {
      try { await navigator.share({ title: 'AI-Lineamento', text: what() === 'result' ? `Prima: «${state.original}»\nDopo: «${state.result.text}»` : 'Traduttore satirico in aziendalese', url }); }
      catch (err) { if (err.name !== 'AbortError') feedback('Condivisione non disponibile: usa Copia link.'); }
    }
  }));

  async function shareInstagram(text) {
    if (what() !== 'result') {
      await copyText(link());
      feedback('Link copiato. Instagram non accetta link nei post: usalo nello sticker Link di una storia o nella bio.');
      return;
    }
    const blob = await imageBlob();
    const file = new File([blob], 'aziendalese.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await copyText(text); await navigator.share({ files: [file], text }); feedback('Scegli Instagram tra le app. Il testo è già copiato per la didascalia.'); return; }
      catch (err) { if (err.name === 'AbortError') return; }
    }
    saveBlob(blob);
    await copyText(text);
    feedback('Immagine scaricata e testo copiato. Caricala su Instagram e aggiungi il link con lo sticker Link nella storia.');
  }

  /* ---------- immagine 1080×1080 ---------- */
  function wrapSegments(ctx, segs, maxW) {
    const words = [];
    segs.forEach(s => s.t.split(/(\s+)/).forEach(w => { if (w) words.push({ w, hl: s.hl }); }));
    const lines = [[]]; let width = 0;
    for (const tok of words) {
      const w = ctx.measureText(tok.w).width;
      if (/^\s+$/.test(tok.w)) { if (lines.at(-1).length) { lines.at(-1).push(tok); width += w; } continue; }
      if (width + w > maxW && lines.at(-1).length) {
        while (lines.at(-1).length && /^\s+$/.test(lines.at(-1).at(-1).w)) lines.at(-1).pop();
        lines.push([]); width = 0;
      }
      lines.at(-1).push(tok); width += w;
    }
    return lines;
  }
  function imageBlob() {
    const c = document.createElement('canvas');
    c.width = 1080; c.height = 1080;
    const ctx = c.getContext('2d');
    const font = '-apple-system, system-ui, "Segoe UI", Roboto, Arial, sans-serif';
    const g = ctx.createLinearGradient(0, 0, 1080, 1080);
    g.addColorStop(0, '#ece8ff'); g.addColorStop(.5, '#ffe6ef'); g.addColorStop(1, '#ffe9d2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1080);
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
    ctx.fillStyle = '#fff'; rr(50, 50, 980, 980, 32);
    const tg = ctx.createLinearGradient(100, 0, 420, 0);
    tg.addColorStop(0, '#6b5bd2'); tg.addColorStop(.5, '#e8457c'); tg.addColorStop(1, '#f97316');
    ctx.font = `900 52px ${font}`;
    ctx.fillStyle = '#f97316'; ctx.fillText('AI', 100, 140);
    const bw = ctx.measureText('AI').width;
    ctx.fillStyle = tg; ctx.fillText('-Lineamento', 100 + bw, 140);
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.font = `500 26px ${font}`;
    ctx.fillText('Traduttore satirico in aziendalese · keynote mode', 100, 185);
    ctx.font = `800 22px ${font}`; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillText('PRIMA', 100, 255);
    ctx.font = `400 32px ${font}`; ctx.fillStyle = 'rgba(0,0,0,.7)';
    let y = 300;
    for (const line of wrapSegments(ctx, [{ t: '«' + state.original + '»' }], 880).slice(0, 3)) { ctx.fillText(line.map(t => t.w).join(''), 100, y); y += 44; }
    y += 14;
    const top = y, bottom = 880;
    const sg = ctx.createRadialGradient(540, top - 60, 40, 540, top + 200, 700);
    sg.addColorStop(0, '#3d2f8f'); sg.addColorStop(.6, '#1b1446'); sg.addColorStop(1, '#120d2e');
    ctx.fillStyle = sg; rr(80, top, 920, bottom - top, 26);
    let size = 46, lines;
    do { ctx.font = `700 ${size}px ${font}`; lines = wrapSegments(ctx, state.result.segments, 840); size -= 2; } while (lines.length * size * 1.4 > bottom - top - 70 && size > 24);
    size += 2; const lh = size * 1.4;
    y = top + 40 + size;
    for (const line of lines) {
      let x = 120;
      for (const tok of line) {
        const w = ctx.measureText(tok.w).width;
        if (tok.hl) { ctx.fillStyle = '#ffcf4a'; ctx.fillRect(x - 2, y - size * .9, w + 4, size * 1.18); ctx.fillStyle = '#1b1446'; }
        else ctx.fillStyle = '#fff';
        ctx.fillText(tok.w, x, y); x += w;
      }
      y += lh;
    }
    const my = 940;
    ctx.font = `700 26px ${font}`; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText('Indice di aziendalese', 100, my);
    ctx.fillStyle = '#efedf6'; rr(420, my - 20, 440, 18, 9);
    ctx.fillStyle = tg; rr(420, my - 20, 440 * state.result.score / 100, 18, 9);
    ctx.fillStyle = '#e8457c'; ctx.font = `900 30px ${font}`; ctx.fillText(state.result.score + '%', 880, my);
    ctx.font = `400 21px ${font}`; ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillText('Esperimento satirico per sdrammatizzare la vita d’ufficio · ' + appUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''), 100, 990);
    return new Promise(r => c.toBlob(r, 'image/png'));
  }
  function saveBlob(blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'aziendalese.png';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function downloadImage() { if (state.result) saveBlob(await imageBlob()); }

  /* ---------- risultato condiviso via link ---------- */
  function loadShared() {
    const m = /^#r=([A-Za-z0-9_-]{10,4000})$/.exec(location.hash);
    if (!m) return;
    try {
      const p = JSON.parse(b64.dec(m[1]));
      const ok = p && typeof p.o === 'string' && [...p.o].length <= LIMITS.up &&
        Number.isFinite(p.s) && typeof p.j === 'string' && p.j.length < 80 && Array.isArray(p.g) && p.g.length < 80 &&
        p.g.every(x => Array.isArray(x) && typeof x[0] === 'string' && x[0].length < 400);
      if (!ok) return;
      const segments = p.g.map(([t, hl]) => ({ t, hl: !!hl }));
      const res = { text: segments.map(s => s.t).join(''), segments, score: Math.max(0, Math.min(99, Math.round(p.s))), title: p.j, seed: 0 };
      state = { original: p.o, result: res };
      $('#shared-banner').after(post);
      render(res, p.o);
      $('#vote').hidden = true;
      $('#shared-banner').hidden = false;
    } catch { /* link non valido: si apre il traduttore vuoto */ }
  }

  /* ---------- glossario, parola e consiglio del giorno, tendenze ---------- */
  const gList = $('#glossary-list'), gSearch = $('#glossary-search'), gCat = $('#glossary-cat');
  const cats = [...new Set(VOC.map(v => v.c))];
  gCat.append(new Option('Tutte le categorie', ''), ...cats.map(c => new Option(c, c)));
  const fold = s => s.toLocaleLowerCase('it').normalize('NFD').replace(/\p{M}/gu, '');
  function renderGlossary() {
    const q = fold(gSearch.value.trim()), c = gCat.value;
    const items = VOC.filter(v => (!c || v.c === c) && (!q || fold(`${v.t} ${v.o} ${v.p} ${v.m}`).includes(q)));
    $('#glossary-count').textContent = `${items.length} termini su ${VOC.length}`;
    gList.replaceChildren(...items.map(v => {
      const li = document.createElement('li');
      li.innerHTML = '<span class="cat"></span><h4></h4><p class="plain"></p><p class="ex"></p>';
      li.querySelector('.cat').textContent = v.c + (v.o && v.o !== v.t ? ' · da ' + v.o : '');
      li.querySelector('h4').textContent = v.t;
      li.querySelector('.plain').textContent = 'In italiano chiaro: ' + v.p + '.';
      li.querySelector('.ex').textContent = '«' + v.e + '»';
      return li;
    }));
  }
  gSearch.addEventListener('input', renderGlossary);
  gCat.addEventListener('change', renderGlossary);
  function openGlossary(q = '') { gSearch.value = q; gCat.value = ''; renderGlossary(); $('#glossary-dialog').showModal(); }
  $('#top-search').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openGlossary(e.target.value); e.target.value = ''; } });

  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  if (VOC.length) {
    const w = VOC[day % VOC.length];
    $('#wotd-term').textContent = w.t;
    $('#wotd-cat').textContent = w.c;
    $('#wotd-plain').textContent = 'Traduzione: ' + w.p + '.';
    $('#wotd-example').textContent = '«' + w.e + '»';
    const pool = [...VOC].sort(() => Math.random() - .5).slice(0, 5);
    $('#trending').replaceChildren(...pool.map((v, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.innerHTML = '<b></b><small></small>';
      b.querySelector('b').textContent = v.t;
      b.querySelector('small').textContent = `${(9 - i) * 137 + Math.floor(Math.random() * 90)} menzioni in call oggi`;
      b.addEventListener('click', () => openGlossary(v.t.split(' /')[0]));
      li.append(b); return li;
    }));
  }
  const TIPS = window.TIPS || [];
  let tipIndex = day % Math.max(1, TIPS.length);
  function showTip() {
    const t = TIPS[tipIndex];
    if (!t) return;
    $('#tip-kind').textContent = t.k;
    $('#tip-text').textContent = t.t;
    $('#tip-src').textContent = t.src ? 'Fonte: ' + t.src : '';
  }
  $('#tip-next').addEventListener('click', () => { tipIndex = (tipIndex + 1) % TIPS.length; showTip(); });
  showTip();

  /* ---------- bingo ---------- */
  const BINGO_WORDS = ['Allinearsi', 'ASAP', 'Call', 'Brainstorming', 'Follow-up', 'Deadline', 'Feedback', 'Core business', 'Best practice', 'Out of the box', 'Win-win', 'Stakeholder', 'Sinergia', 'Quick win', 'Budget', 'KPI', 'Task', 'Briefare', 'Schedulare', 'Escalare', 'Mindset', 'Smart working', 'Recap', 'End-to-end', 'Deep dive', 'Bandwidth', 'Bottleneck', 'Milestone', 'WIP', 'Low-hanging fruit', 'Game changer', 'Disruptive', 'Target', 'Benchmark', 'Engagement', 'Empowerment', 'Risorsa', 'Decision maker', 'Helicopter view', 'Touchpoint', 'Action item', 'Out of scope', 'Deliverable', 'Pingare', 'Fixare', 'Pushare', 'Deck', 'Takeaway', 'A tendere', 'Mi sentite?'];
  function newBingo() {
    const words = [...BINGO_WORDS].sort(() => Math.random() - .5).slice(0, 24);
    words.splice(12, 0, null);
    $('#bingo-grid').replaceChildren(...words.map(w => {
      const b = document.createElement('button');
      b.type = 'button';
      if (w === null) { b.textContent = 'Gratis: supercazzola'; b.className = 'free'; b.setAttribute('aria-pressed', 'true'); b.disabled = true; }
      else { b.textContent = w; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); checkBingo(); }); }
      return b;
    }));
    $('#bingo-status').textContent = '';
  }
  function checkBingo() {
    const on = $$('#bingo-grid button').map(b => b.getAttribute('aria-pressed') === 'true');
    const lines = [];
    for (let i = 0; i < 5; i++) { lines.push([0, 1, 2, 3, 4].map(j => i * 5 + j)); lines.push([0, 1, 2, 3, 4].map(j => j * 5 + i)); }
    lines.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
    $('#bingo-status').textContent = lines.some(l => l.every(i => on[i])) ? 'BINGO! Ora resta serio fino alla fine della call.' : '';
  }
  $('#bingo-new').addEventListener('click', newBingo);
  newBingo();

  /* ---------- dialog e varie ---------- */
  $$('[data-open]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.open;
    if (id === 'glossary-dialog') openGlossary(); else $('#' + id).showModal();
  }));
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  $('#stat-count').textContent = store.get('at-count', 0);
  $('#stat-fluff').textContent = store.get('at-fluff', 0);
  setDir('up');
  loadShared();
  window.addEventListener('hashchange', loadShared);
  loadCommunity();
})();
