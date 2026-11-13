/* Generato da tools/build.sh: non modificare a mano. */
/* AI-Lineamento. Motore di traduzione italiano -> aziendalese.
   Tutto gira nel browser: nessun testo viene inviato a server. */
(function (root) {
  'use strict';

  const L = '\\p{L}\\p{N}';
  const B0 = `(?<![${L}])`;          // confine sinistro (funziona con le lettere accentate)
  const B1 = `(?![${L}])`;           // confine destro
  const AP = "['’]";

  /* ---------- casualità senza ripetizioni ---------- */
  const recent = {};
  let rnd = Math.random;
  function pick(pool, key, avoid = 5) {
    if (!pool || !pool.length) return null;
    const used = recent[key] || (recent[key] = []);
    const k = Math.min(avoid, pool.length - 1);
    const last = used.slice(-k);
    let idx = pool.map((_, i) => i).filter(i => !last.includes(i));
    if (!idx.length) idx = pool.map((_, i) => i);
    const i = idx[Math.floor(rnd() * idx.length)];
    used.push(i);
    if (used.length > 20) used.shift();
    return pool[i];
  }
  const chance = p => rnd() < p;

  /* ---------- coniugazione ---------- */
  const IRREG = {
    fare: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'],
    avere: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
    essere: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
    andare: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'],
    dare: ['do', 'dai', 'dà', 'diamo', 'date', 'danno'],
    stare: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'],
    dire: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'],
    tenere: ['tengo', 'tieni', 'tiene', 'teniamo', 'tenete', 'tengono'],
    detenere: ['detengo', 'detieni', 'detiene', 'deteniamo', 'detenete', 'detengono'],
    mantenere: ['mantengo', 'mantieni', 'mantiene', 'manteniamo', 'mantenete', 'mantengono'],
    uscire: ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono'],
    prendere: ['prendo', 'prendi', 'prende', 'prendiamo', 'prendete', 'prendono'],
    entrare: ['entro', 'entri', 'entra', 'entriamo', 'entrate', 'entrano']
  };
  const PP = {
    fare: 'fatto', dire: 'detto', scrivere: 'scritto', leggere: 'letto', decidere: 'deciso',
    chiudere: 'chiuso', rispondere: 'risposto', chiedere: 'chiesto', mettere: 'messo',
    prendere: 'preso', vedere: 'visto', perdere: 'perso', risolvere: 'risolto', aprire: 'aperto',
    offrire: 'offerto', essere: 'stato', discutere: 'discusso', spendere: 'speso',
    correggere: 'corretto', condividere: 'condiviso', riassumere: 'riassunto', detenere: 'detenuto',
    mantenere: 'mantenuto', tenere: 'tenuto', rimanere: 'rimasto', promuovere: 'promosso'
  };
  const ISC = new Set(['finire', 'capire', 'gestire', 'pulire', 'preferire', 'costruire', 'definire',
    'spedire', 'fornire', 'garantire', 'abolire', 'smaltire', 'stabilire', 'restituire', 'eseguire']);
  const REFL = ['mi', 'ti', 'si', 'ci', 'vi', 'si'];

  function regular(inf, p) {
    const end = inf.slice(-3), st = inf.slice(0, -3);
    if (p === 6) return PP[inf] || (end === 'are' ? st + 'ato' : end === 'ere' ? st + 'uto' : st + 'ito');
    if (p === 7) return inf === 'fare' ? 'facendo' : inf === 'dire' ? 'dicendo' : st + (end === 'are' ? 'ando' : 'endo');
    if (IRREG[inf]) return IRREG[inf][p];
    let s = st, e;
    if (end === 'are') {
      e = ['o', 'i', 'a', 'iamo', 'ate', 'ano'][p];
      if (e[0] === 'i') { if (/i$/.test(s)) s = s.slice(0, -1); else if (/[cg]$/.test(s)) s += 'h'; }
      return s + e;
    }
    if (end === 'ere') {
      e = ['o', 'i', 'e', 'iamo', 'ete', 'ono'][p];
      if (e[0] === 'i' && /i$/.test(s)) s = s.slice(0, -1);
      return s + e;
    }
    if (end === 'ire') {
      return s + (ISC.has(inf) ? ['isco', 'isci', 'isce', 'iamo', 'ite', 'iscono'] : ['o', 'i', 'e', 'iamo', 'ite', 'ono'])[p];
    }
    return inf;
  }
  // p: -1 infinito, 0..5 persone, 6 participio, 7 gerundio
  function conj(inf, p) {
    if (p < 0) return inf;
    if (/(?:ar|er|ir)si$/.test(inf)) {
      const base = inf.slice(0, -2) + 'e';
      if (p >= 6) return regular(base, p);
      return REFL[p] + ' ' + regular(base, p);
    }
    return regular(inf, p);
  }
  // coniuga solo il primo verbo di una locuzione ("fare un check su" -> "faccio un check su")
  function conjPhrase(phrase, p) {
    const [first, ...rest] = phrase.split(' ');
    return [conj(first, p), ...rest].join(' ');
  }

  /* ---------- articoli ---------- */
  const ARTS = {
    il: ['', 'd', 'm', 's'], lo: ['', 'd', 'm', 's'], la: ['', 'd', 'f', 's'], i: ['', 'd', 'm', 'p'], gli: ['', 'd', 'm', 'p'], le: ['', 'd', 'f', 'p'],
    un: ['', 'i', 'm', 's'], uno: ['', 'i', 'm', 's'], una: ['', 'i', 'f', 's'],
    del: ['di', 'd', 'm', 's'], dello: ['di', 'd', 'm', 's'], della: ['di', 'd', 'f', 's'], dei: ['di', 'd', 'm', 'p'], degli: ['di', 'd', 'm', 'p'], delle: ['di', 'd', 'f', 'p'],
    al: ['a', 'd', 'm', 's'], allo: ['a', 'd', 'm', 's'], alla: ['a', 'd', 'f', 's'], ai: ['a', 'd', 'm', 'p'], agli: ['a', 'd', 'm', 'p'], alle: ['a', 'd', 'f', 'p'],
    dal: ['da', 'd', 'm', 's'], dallo: ['da', 'd', 'm', 's'], dalla: ['da', 'd', 'f', 's'], dai: ['da', 'd', 'm', 'p'], dagli: ['da', 'd', 'm', 'p'], dalle: ['da', 'd', 'f', 'p'],
    nel: ['in', 'd', 'm', 's'], nello: ['in', 'd', 'm', 's'], nella: ['in', 'd', 'f', 's'], nei: ['in', 'd', 'm', 'p'], negli: ['in', 'd', 'm', 'p'], nelle: ['in', 'd', 'f', 'p'],
    sul: ['su', 'd', 'm', 's'], sullo: ['su', 'd', 'm', 's'], sulla: ['su', 'd', 'f', 's'], sui: ['su', 'd', 'm', 'p'], sugli: ['su', 'd', 'm', 'p'], sulle: ['su', 'd', 'f', 'p'],
    "l'": ['', 'd', null, 's'], "un'": ['', 'i', 'f', 's'], "dell'": ['di', 'd', null, 's'], "all'": ['a', 'd', null, 's'],
    "dall'": ['da', 'd', null, 's'], "nell'": ['in', 'd', null, 's'], "sull'": ['su', 'd', null, 's']
  };
  const ART_SPACED = Object.keys(ARTS).filter(a => !a.endsWith("'"));
  const ART_ELIDED = Object.keys(ARTS).filter(a => a.endsWith("'")).map(a => a.slice(0, -1));
  const POSS = { mi: ['mio', 'mia', 'miei', 'mie'], tu: ['tuo', 'tua', 'tuoi', 'tue'], su: ['suo', 'sua', 'suoi', 'sue'], nostr: ['nostro', 'nostra', 'nostri', 'nostre'], vostr: ['vostro', 'vostra', 'vostri', 'vostre'] };
  const POSS_FORMS = Object.values(POSS).flat();
  const possStem = w => Object.keys(POSS).find(k => POSS[k].includes(w));

  const startsVowel = w => /^[aeiouàèéìòùh]/i.test(w);
  const sImpura = w => /^(s[^aeiouàèéìòù]|z|gn|ps|pn|x|y)/i.test(w);
  function article(prep, type, g, n, next) {
    if (!type) return prep ? prep : '';
    if (type === 'i' && n === 'p') { prep = prep || 'di'; type = 'd'; }
    if (type === 'i') {
      const a = g === 'm' ? (sImpura(next) ? 'uno' : 'un') : (startsVowel(next) ? "un'" : 'una');
      return prep ? prep + ' ' + a : a;
    }
    let a;
    if (n === 's') a = g === 'm' ? (startsVowel(next) ? "l'" : sImpura(next) ? 'lo' : 'il') : (startsVowel(next) ? "l'" : 'la');
    else a = g === 'm' ? (startsVowel(next) || sImpura(next) ? 'gli' : 'i') : 'le';
    if (!prep) return a;
    const head = { di: 'de', a: 'a', da: 'da', in: 'ne', su: 'su' }[prep];
    const tail = { il: 'l', lo: 'llo', la: 'lla', "l'": "ll'", i: 'i', gli: 'gli', le: 'lle' }[a];
    return head + tail;
  }
  const joinArt = (a, w) => !a ? w : a.endsWith("'") ? a + w : a + ' ' + w;

  /* ---------- dati: verbi ---------- */
  // Bersagli: "T" transitivo (default), "P" se finisce con preposizione (vuole un complemento),
  // "!" iniziale = intransitivo (si usa solo senza complemento oggetto)
  const V = (src, off, key, en) => ({ src: src.split('|'), off, key, en });
  const VERBS = [
    V('controllare|verificare', ['checkare', 'fare un check su', 'dare una review a'], ['presidiare la verifica di', 'governare il monitoraggio di', 'validare'], 'Quality'),
    V('mandare|inviare|spedire|inoltrare|girare', ['forwardare', 'shareare', 'girare al volo'], ['veicolare', 'abilitare la distribuzione di', 'attivare il flusso di trasmissione di'], 'Communication'),
    V('chiamare', ['pingare', 'fare una call con', 'sentire al volo'], ['attivare un touchpoint con', 'aprire un canale di ingaggio con', 'ingaggiare'], 'Engagement'),
    V('telefonare', ['!fare una call', '!fare un colpo di telefono'], ['!attivare un touchpoint telefonico', '!aprire un canale di ingaggio diretto'], 'Engagement'),
    V('parlare|discutere', ['!fare un sync', '!fare un confronto veloce', '!fare due chiacchiere offline'], ['!aprire un tavolo di confronto', '!attivare un dialogo strutturato', '!fare un deep dive'], 'Alignment'),
    V('scrivere', ['draftare', 'buttare giù', 'mettere nero su bianco'], ['redigere', 'strutturare', 'formalizzare'], 'Content'),
    V('organizzare|pianificare|programmare', ['schedulare', 'settare', 'mettere in agenda'], ['orchestrare', 'architettare', 'strutturare'], 'Planning'),
    V('fissare', ['schedulare', 'bloccare in agenda'], ['formalizzare a calendario', 'calendarizzare'], 'Planning'),
    V('spostare|rimandare|posticipare|rinviare', ['reschedulare', 'shiftare', 'pushare in avanti'], ['riposizionare nella roadmap', 'riallocare temporalmente', 'ripianificare'], 'Planning'),
    V('finire|completare|terminare', ['chiudere', 'finalizzare', 'deliverare'], ['portare a compimento', 'finalizzare end-to-end', 'consolidare'], 'Delivery'),
    V('correggere|sistemare|riparare|aggiustare', ['fixare', 'sistemare al volo', 'patchare'], ['efficientare', 'ottimizzare', 'risolvere strutturalmente'], 'Optimization'),
    V('decidere', ['!chiudere il punto', 'fare una call su', '!prendere una decisione'], ['!formalizzare una decisione', 'deliberare in merito a', '!esercitare la leadership decisionale'], 'Decision'),
    V('aiutare|supportare', ['supportare', 'dare supporto a', 'dare una mano a'], ['abilitare', 'fare empowerment di', 'accompagnare'], 'Enablement'),
    V('lavorare', ['performare', '!smazzarmi task', 'lavorare'], ['generare valore', '!creare impatto', 'presidiare'], 'Operations'),
    V('preparare', ['settare', 'buildare', 'preparare'], ['strutturare', 'architettare', 'predisporre'], 'Operations'),
    V('stampare', ['printare', 'stampare'], ['materializzare su supporto cartaceo', 'rendere tangibile'], 'Printing'),
    V('copiare', ['duplicare', 'fare copy-paste di'], ['replicare in modalità scalabile', 'riprodurre'], 'Copy'),
    V('aggiornare', ['updatare', 'fare un update di'], ['evolvere', 'allineare allo stato dell’arte'], 'Reporting'),
    V('cambiare|modificare', ['switchare', 'fare un tweak a', 'cambiare'], ['trasformare', 'abilitare il cambiamento di', 'reinventare'], 'Transformation'),
    V('provare|testare', ['testare', 'fare un tentativo con'], ['sperimentare in modalità pilota', 'validare', 'prototipare'], 'Innovation'),
    V('cercare', ['fare scouting di', 'cercare'], ['avviare un processo di discovery su', 'esplorare'], 'Discovery'),
    V('pagare|saldare', ['saldare', 'pagare'], ['valorizzare economicamente', 'regolarizzare'], 'Finance'),
    V('spiegare|presentare', ['briefare su', 'fare un walkthrough di', 'briefare'], ['fare storytelling su', 'evangelizzare', 'raccontare'], 'Storytelling'),
    V('iniziare|cominciare|avviare', ['kickoffare', 'startare'], ['dare il via a', 'avviare il go-live di', 'lanciare'], 'Launch'),
    V('risolvere', ['fixare', 'sbloccare'], ['indirizzare', 'risolvere in modo strutturale'], 'Problem Solving'),
    V('vendere', ['vendere', 'chiudere'], ['monetizzare', 'convertire in revenue'], 'Sales'),
    V('comprare|acquistare|ordinare', ['procurare', 'fare procurement di'], ['approvvigionare', 'attivare un processo di sourcing per'], 'Procurement'),
    V('capire', ['capire', 'avere visibilità su'], ['decodificare', 'acquisire consapevolezza di'], 'Insight'),
    V('gestire', ['gestire', 'avere l’ownership di', 'handlare'], ['presidiare', 'governare', 'orchestrare'], 'Operations'),
    V('seguire|monitorare', ['seguire', 'tenere il follow-up di', 'monitorare'], ['presidiare', 'monitorare in modo continuativo'], 'Follow-up'),
    V('pulire|riordinare', ['fare decluttering di', 'pulire'], ['efficientare gli spazi di', 'riorganizzare in ottica lean'], 'Lean'),
    V('mangiare', ['mangiare', '!fare lunch', '!fare un lunch veloce'], ['consumare', '!ricaricare le energie', '!attivare un momento di networking conviviale'], 'Lunch'),
    V('pranzare', ['!fare lunch', '!fare un lunch meeting'], ['!attivare un momento di networking conviviale', '!ricaricare le energie'], 'Lunch'),
    V('dormire|riposare', ['!andare offline', '!staccare'], ['!entrare in modalità low power', '!attivare una fase di recovery'], 'Wellbeing'),
    V('arrivare', ['!arrivare', '!essere on site'], ['!garantire la presenza on site', '!presidiare il territorio'], 'Presence'),
    V('aspettare|attendere', ['aspettare', 'essere in attesa di', '!stare in standby'], ['restare in attesa di', '!mantenere una posizione di attesa strategica'], 'Patience'),
    V('rispondere', ['!dare un feedback', '!rispondere'], ['!fornire un riscontro', '!restituire un feedback strutturato'], 'Feedback'),
    V('chiedere|domandare', ['chiedere', 'fare una request di'], ['sollecitare', 'formalizzare una richiesta di'], 'Request'),
    V('leggere', ['leggere', 'skimmare', 'dare un’occhiata a'], ['analizzare', 'fare un deep dive su'], 'Insight'),
    V('incontrare', ['fare un meeting con', 'vedere'], ['attivare un touchpoint con', 'ingaggiare'], 'Networking'),
    V('ricordare', ['remindare', 'ricordare'], ['ribadire', 'sottolineare'], 'Reminder'),
    V('dimenticare', ['droppare', 'perdere il focus su'], ['deprioritizzare', 'non presidiare'], 'Focus'),
    V('approvare|validare', ['approvare', 'dare l’ok a'], ['validare', 'dare il green light a'], 'Approval'),
    V('firmare', ['firmare', 'fare il sign-off di'], ['ratificare', 'formalizzare con firma'], 'Approval'),
    V('consegnare', ['deliverare', 'consegnare'], ['rilasciare', 'finalizzare la delivery di'], 'Delivery'),
    V('studiare|imparare', ['studiare', 'fare upskilling su'], ['approfondire', 'investire in formazione continua su'], 'Learning'),
    V('caricare', ['uploadare', 'caricare'], ['integrare a sistema', 'rendere disponibile'], 'Digital'),
    V('scaricare', ['downloadare', 'scaricare'], ['acquisire in locale', 'internalizzare'], 'Digital'),
    V('salvare', ['salvare', 'fare il backup di'], ['mettere in sicurezza', 'preservare'], 'Continuity'),
    V('cancellare|eliminare', ['droppare', 'deletare'], ['dismettere', 'razionalizzare'], 'Lean'),
    V('condividere', ['shareare', 'condividere'], ['diffondere', 'mettere a fattor comune'], 'Sharing'),
    V('riassumere', ['recappare', 'fare un recap di'], ['sintetizzare', 'consolidare in un executive summary'], 'Reporting'),
    V('spendere', ['spendere', 'bruciare budget su'], ['investire', 'allocare risorse su'], 'Finance'),
    V('risparmiare', ['risparmiare', 'fare saving su'], ['ottimizzare', 'efficientare i costi di'], 'Finance'),
    V('chiudere', ['chiudere', 'wrappare'], ['finalizzare', 'portare a closing'], 'Closing'),
    V('ascoltare', ['ascoltare', 'tenere in ascolto'], ['recepire', 'fare active listening su'], 'Listening'),
    V('guardare', ['checkare', 'dare un occhio a'], ['analizzare', 'osservare con helicopter view'], 'Insight'),
    V('sbagliare', ['!fare un errore', '!sbagliare'], ['!generare un learning', '!vivere un’opportunità di apprendimento'], 'Learning'),
    V('lamentarsi', ['!fare feedback negativo', '!lamentarsi'], ['!esprimere un’area di miglioramento', '!condividere un pain point'], 'Feedback'),
    V('ritardare', ['!sforare', '!slittare'], ['!registrare uno scostamento', '!ricalibrare la timeline'], 'Timeline')
  ];
  // Regole "da keynote": nominalizzazione, itanglese, acronimi, metafore manageriali
  VERBS.push(V('licenziare|mandare via', ['tagliare', 'lasciare a casa'], ['procedere alla riorganizzazione delle sinergie di', 'rightsizare', 'accompagnare verso nuove opportunità'], 'People Transformation'));
  VERBS.push(V('trovarsi|vedersi|sentirsi|riunirsi', ['!fare un sync', '!fare una call'], ['!procedere a un allineamento sincrono', '!convergere in un momento di sync', '!attivare un touchpoint di team'], 'Alignment'));
  VERBS.push(V('ricevere|ottenere', ['ricevere', 'portare a casa'], ['acquisire', 'portare a casa', 'finalizzare il closing di'], 'Sales'));
  VERBS.push(V('prenotare', ['bookare', 'bloccare'], ['procedere al booking di', 'bloccare in ottica win-win'], 'Facilities'));
  const EXTRA_KEY = {
    controllare: ['procedere a un deep dive su', 'checkare in ottica end-to-end'],
    mandare: ['procedere al forwarding di', 'forwardare in ottica win-win'],
    chiamare: ['procedere a un touchpoint con', 'pingare in modalità ASAP'],
    telefonare: ['!procedere a un touchpoint vocale ASAP'],
    parlare: ['!procedere a un allineamento strategico', '!fare sinergia a livello di dialogo'],
    scrivere: ['procedere alla redazione di', 'draftare in ottica strategica'],
    organizzare: ['procedere alla schedulazione di', 'schedulare in ottica win-win'],
    fissare: ['procedere alla schedulazione di'],
    spostare: ['procedere al reschedule di', 'reschedulare in ottica di flessibilità'],
    finire: ['procedere alla finalizzazione di', 'deliverare entro EOD'],
    correggere: ['procedere al fixing di', 'fixare in modalità ASAP'],
    decidere: ['!procedere alla finalizzazione del processo decisionale', 'procedere alla finalizzazione del processo decisionale in merito a'],
    aiutare: ['garantire supporto in ottica win-win a'],
    preparare: ['procedere alla predisposizione di'],
    risolvere: ['procedere al fixing di', 'fixare in ottica strutturale'],
    chiedere: ['procedere alla raccolta di input su'],
    mangiare: ['!procedere a un refuel energetico'],
    spiegare: ['procedere a un walkthrough di', 'briefare in ottica strategica'],
    iniziare: ['procedere al kick-off di', 'kickoffare in ottica disruptive'],
    cambiare: ['procedere alla trasformazione di'],
    consegnare: ['procedere alla delivery di', 'deliverare entro EOD'],
    approvare: ['procedere alla validazione di'],
    leggere: ['procedere a un deep dive su'],
    gestire: ['avere la full ownership di'],
    seguire: ['monitorare a livello di KPI'],
    lavorare: ['!performare a livello di KPI', '!generare valore ASAP'],
    cercare: ['procedere allo scouting di'],
    aspettare: ['restare in standby strategico su']
  };
  for (const e of VERBS) { const x = EXTRA_KEY[e.src[0]]; if (x) e.key.push(...x); }

  // locuzioni verbali: base + complemento
  const PV = (base, obj, off, key, en) => ({ base, obj, off, key, en });
  const PHRASAL = [
    PV('fare', '(?:le |delle |un po’ di |un po\' di )?fotocopie', ['gestire il workflow delle copie', 'presidiare il fronte-retro'], ['orchestrare la riproduzione analogica di asset documentali', 'governare la duplicazione cartacea dei contenuti strategici'], 'Copy'),
    PV('fare', '(?:una |la )?(?:pausa|pausetta)', ['fare un break', 'staccare cinque minuti'], ['attivare un momento di decompressione', 'investire in una finestra di recovery'], 'Wellbeing'),
    PV('fare|prendere|bere', '(?:il |un |uno )?(?:caffè|caffe|caffettino|espresso)', ['fare un coffee break', 'fare un refill di caffeina'], ['avviare un ciclo di ricarica a base di caffeina', 'abilitare un rituale di networking intorno alla macchinetta'], 'Coffee'),
    PV('fare|organizzare', '(?:una |la |delle |le )?riunion[ei]', ['fare una call', 'fare un meeting', 'settare un sync'], ['convocare una sessione plenaria di allineamento', 'istituire un tavolo di lavoro interfunzionale'], 'Meeting'),
    PV('fare|prendere', '(?:le |delle |qualche giorno di )?ferie', ['andare OOO', 'staccare la spina'], ['attivare un periodo di disconnessione strategica', 'investire nel mio work-life balance'], 'Wellbeing'),
    PV('andare', 'in ferie', ['andare OOO', 'staccare la spina'], ['attivare un periodo di disconnessione strategica', 'investire nel mio work-life balance'], 'Wellbeing'),
    PV('fare', '(?:gli |degli |lo )?straordinari[oi]?', ['fare overtime', 'restare online fino a tardi'], ['estendere la mia disponibilità oltre il perimetro contrattuale', 'garantire una copertura extra-perimetro'], 'Commitment'),
    PV('fare', '(?:il )?punto', ['fare un recap', 'fare un quick check'], ['consolidare lo stato dell’arte', 'fare una ricognizione dello stato di avanzamento'], 'Reporting'),
    PV('fare', '(?:una |la )?telefonata', ['fare una call', 'fare un colpo di telefono'], ['attivare un touchpoint telefonico', 'aprire un canale vocale diretto'], 'Engagement'),
    PV('fare', '(?:un |il )?preventivo', ['buildare una quotation', 'fare un’offerta al volo'], ['strutturare una proposta di valore economica', 'formalizzare una value proposition quotata'], 'Sales'),
    PV('fare', '(?:i )?conti', ['fare un check sui numeri', 'fare due conti sul budget'], ['consolidare i KPI finanziari', 'fare un deep dive sulla sostenibilità economica'], 'Finance'),
    PV('fare', '(?:la )?spesa', ['fare procurement alimentare', 'fare un giro di sourcing al supermercato'], ['attivare il sourcing domestico', 'ottimizzare la supply chain familiare'], 'Procurement'),
    PV('prendere', '(?:una )?decisione', ['chiudere il punto', 'fare una call decisionale'], ['formalizzare una decisione strategica', 'esercitare la leadership decisionale'], 'Decision'),
    PV('andare', '(?:in|al) bagno', ['fare un quick break', 'andare offline cinque minuti'], ['attivare un breve presidio dei servizi', 'gestire un’urgenza non pianificata'], 'Facilities'),
    PV('lavorare', 'da casa', ['fare smart working', 'andare in full remote'], ['abilitare un modello di lavoro ibrido', 'presidiare le attività da remoto'], 'Remote Work'),
    PV('andare', '(?:a )?casa', ['staccare', 'andare offline'], ['chiudere la giornata operativa', 'disattivare la presenza on site'], 'Work-Life Balance'),
    PV('andare', 'a pranzo', ['fare lunch', 'fare un lunch veloce'], ['attivare un momento di networking conviviale', 'ricaricare le energie in compagnia'], 'Lunch'),
    PV('dare', '(?:un[’\']|una )?occhiata', ['fare un check', 'dare una skimmata'], ['fare un deep dive', 'adottare una helicopter view'], 'Insight'),
    PV('fare', '(?:una |la )?presentazione', ['preparare un deck', 'buildare le slide'], ['costruire uno storytelling strategico', 'orchestrare una narrazione visiva ad alto impatto'], 'Storytelling'),
    PV('fare', '(?:le |delle )?pulizie', ['fare decluttering', 'fare pulizia'], ['riorganizzare gli spazi in ottica lean', 'avviare un progetto di decluttering strategico'], 'Lean')
  ];

  /* ---------- dati: nomi ---------- */
  // [singolare, plurale, genere]
  const N = (forms, g, off, key, en, needArt) => ({ forms: forms.split('|').map(f => f.split('/')), g, off, key, en, needArt });
  const t = (s, p, g) => [s, p, g];
  const NOUNS = [
    N('riunione/riunioni|meeting/meeting', 'f', [t('call', 'call', 'f'), t('meeting', 'meeting', 'm'), t('sync', 'sync', 'm')], [t('sessione di allineamento strategico', 'sessioni di allineamento strategico', 'f'), t('tavolo di lavoro interfunzionale', 'tavoli di lavoro interfunzionali', 'm'), t('momento di convergenza', 'momenti di convergenza', 'm')], 'Meeting'),
    N('email/email|e-mail/e-mail|mail/mail', 'f', [t('mail', 'mail', 'f'), t('thread', 'thread', 'm')], [t('comunicazione asincrona', 'comunicazioni asincrone', 'f'), t('flusso informativo digitale', 'flussi informativi digitali', 'm')], 'Inbox'),
    N('messaggio/messaggi', 'm', [t('ping', 'ping', 'm'), t('messaggino su Teams', 'messaggini su Teams', 'm')], [t('touchpoint comunicativo', 'touchpoint comunicativi', 'm'), t('input conversazionale', 'input conversazionali', 'm')], 'Messaging'),
    N('fotocopia/fotocopie|copia/copie', 'f', [t('copia', 'copie', 'f'), t('print', 'print', 'f')], [t('riproduzione analogica', 'riproduzioni analogiche', 'f'), t('asset documentale cartaceo', 'asset documentali cartacei', 'm')], 'Copy', true),
    N('stampante/stampanti', 'f', [t('printer', 'printer', 'f'), t('device di stampa', 'device di stampa', 'm')], [t('infrastruttura di output cartaceo', 'infrastrutture di output cartaceo', 'f'), t('presidio di stampa', 'presidi di stampa', 'm')], 'Printing'),
    N('caffè/caffè|caffe/caffe', 'm', [t('coffee break', 'coffee break', 'm'), t('refill di caffeina', 'refill di caffeina', 'm')], [t('momento di ricarica cognitiva', 'momenti di ricarica cognitiva', 'm'), t('rituale di networking', 'rituali di networking', 'm')], 'Coffee'),
    N('pausa/pause', 'f', [t('break', 'break', 'm')], [t('finestra di recovery', 'finestre di recovery', 'f'), t('momento di decompressione', 'momenti di decompressione', 'm')], 'Wellbeing'),
    N('pranzo/pranzi', 'm', [t('lunch', 'lunch', 'm')], [t('momento conviviale di networking', 'momenti conviviali di networking', 'm')], 'Lunch'),
    N('capo/capi|responsabile/responsabili|direttore/direttori|boss/boss', 'm', [t('manager', 'manager', 'm'), t('boss', 'boss', 'm'), t('line manager', 'line manager', 'm')], [t('decision maker', 'decision maker', 'm'), t('C-level', 'C-level', 'm'), t('leadership team', 'leadership team', 'm')], 'Leadership'),
    N('collega/colleghi|colleghe/colleghe', 'm', [t('risorsa', 'risorse', 'f'), t('teammate', 'teammate', 'm')], [t('stakeholder interno', 'stakeholder interni', 'm'), t('talento', 'talenti', 'm')], 'People'),
    N('cliente/clienti', 'm', [t('customer', 'customer', 'm'), t('key account', 'key account', 'm')], [t('stakeholder esterno', 'stakeholder esterni', 'm'), t('partner strategico', 'partner strategici', 'm')], 'Customer'),
    N('problema/problemi', 'm', [t('blocker', 'blocker', 'm'), t('issue', 'issue', 'f')], [t('criticità operativa', 'criticità operative', 'f'), t('area di miglioramento', 'aree di miglioramento', 'f'), t('pain point', 'pain point', 'm')], 'Problem Solving'),
    N('errore/errori|sbaglio/sbagli', 'm', [t('bug', 'bug', 'm'), t('glitch', 'glitch', 'm')], [t('opportunità di apprendimento', 'opportunità di apprendimento', 'f'), t('scostamento dal piano', 'scostamenti dal piano', 'm')], 'Quality'),
    N('scadenza/scadenze', 'f', [t('deadline', 'deadline', 'f')], [t('milestone vincolante', 'milestone vincolanti', 'f')], 'Deadline'),
    N('lavoro/lavori', 'm', [t('task', 'task', 'm'), t('workstream', 'workstream', 'm')], [t('progettualità', 'progettualità', 'f'), t('ecosistema di attività', 'ecosistemi di attività', 'm')], 'Operations', true),
    N('progetto/progetti', 'm', [t('progetto', 'progetti', 'm'), t('stream', 'stream', 'm'), t('project', 'project', 'm')], [t('iniziativa strategica', 'iniziative strategiche', 'f'), t('programma di trasformazione', 'programmi di trasformazione', 'm')], 'Project'),
    N('file/file|documento/documenti', 'm', [t('file', 'file', 'm'), t('deliverable', 'deliverable', 'm'), t('doc', 'doc', 'm')], [t('asset documentale', 'asset documentali', 'm'), t('deliverable strategico', 'deliverable strategici', 'm')], 'Document'),
    N('presentazione/presentazioni', 'f', [t('slide', 'slide', 'f'), t('deck', 'deck', 'm')], [t('narrazione visiva', 'narrazioni visive', 'f'), t('storytelling strategico', 'storytelling strategici', 'm')], 'Storytelling'),
    N('file excel/file excel|excel/excel|foglio excel/fogli excel|foglio di calcolo/fogli di calcolo', 'm', [t('file Excel', 'file Excel', 'm'), t('foglio dei KPI', 'fogli dei KPI', 'm')], [t('infrastruttura tabellare', 'infrastrutture tabellari', 'f'), t('cruscotto dei dati', 'cruscotti dei dati', 'm')], 'Spreadsheet'),
    N('dato/dati|numero/numeri', 'm', [t('KPI', 'KPI', 'm'), t('numero', 'numeri', 'm')], [t('patrimonio informativo', 'patrimoni informativi', 'm'), t('insight', 'insight', 'm')], 'Data', true),
    N('ufficio/uffici', 'm', [t('office', 'office', 'm'), t('open space', 'open space', 'm')], [t('headquarter', 'headquarter', 'm'), t('hub operativo', 'hub operativi', 'm')], 'Workplace'),
    N('computer/computer|pc/pc|portatile/portatili', 'm', [t('laptop', 'laptop', 'm'), t('device', 'device', 'm')], [t('postazione digitale', 'postazioni digitali', 'f'), t('endpoint aziendale', 'endpoint aziendali', 'm')], 'Digital'),
    N('telefono/telefoni|cellulare/cellulari', 'm', [t('device', 'device', 'm'), t('mobile', 'mobile', 'm')], [t('touchpoint telefonico', 'touchpoint telefonici', 'm')], 'Mobile'),
    N('soldi/soldi', 'm', [t('budget', 'budget', 'm')], [t('risorsa economica', 'risorse economiche', 'f'), t('capitale', 'capitali', 'm')], 'Finance'),
    N('tempo/tempi', 'm', [t('bandwidth', 'bandwidth', 'f')], [t('capacità operativa', 'capacità operative', 'f')], 'Time Management', true),
    N('idea/idee', 'f', [t('input', 'input', 'm'), t('spunto', 'spunti', 'm')], [t('visione', 'visioni', 'f'), t('insight strategico', 'insight strategici', 'm')], 'Innovation'),
    N('obiettivo/obiettivi', 'm', [t('target', 'target', 'm'), t('KPI', 'KPI', 'm')], [t('north star', 'north star', 'f'), t('traguardo strategico', 'traguardi strategici', 'm')], 'Goals'),
    N('lista/liste|elenco/elenchi', 'f', [t('to-do list', 'to-do list', 'f'), t('backlog', 'backlog', 'm')], [t('roadmap', 'roadmap', 'f')], 'Planning'),
    N('risposta/risposte', 'f', [t('feedback', 'feedback', 'm'), t('riscontro', 'riscontri', 'm')], [t('riscontro strutturato', 'riscontri strutturati', 'm')], 'Feedback', true),
    N('domanda/domande', 'f', [t('question', 'question', 'f'), t('input', 'input', 'm')], [t('quesito strategico', 'quesiti strategici', 'm')], 'Q&A', true),
    N('aggiornamento/aggiornamenti', 'm', [t('update', 'update', 'm')], [t('checkpoint di avanzamento', 'checkpoint di avanzamento', 'm')], 'Reporting'),
    N('riassunto/riassunti', 'm', [t('recap', 'recap', 'm')], [t('executive summary', 'executive summary', 'm')], 'Reporting'),
    N('appunti/appunti|verbale/verbali', 'm', [t('minute', 'minute', 'm'), t('MoM', 'MoM', 'm')], [t('knowledge base', 'knowledge base', 'f')], 'Knowledge'),
    N('squadra/squadre|gruppo/gruppi', 'f', [t('team', 'team', 'm')], [t('task force', 'task force', 'f')], 'Team'),
    N('accordo/accordi', 'm', [t('deal', 'deal', 'm')], [t('allineamento strategico', 'allineamenti strategici', 'm')], 'Partnership'),
    N('fattura/fatture', 'f', [t('invoice', 'invoice', 'f')], [t('documento contabile', 'documenti contabili', 'm')], 'Billing'),
    N('prezzo/prezzi', 'm', [t('pricing', 'pricing', 'm')], [t('posizionamento economico', 'posizionamenti economici', 'm')], 'Pricing'),
    N('scrivania/scrivanie', 'f', [t('desk', 'desk', 'f'), t('postazione', 'postazioni', 'f')], [t('postazione di lavoro', 'postazioni di lavoro', 'f')], 'Workplace'),
    N('calendario/calendari|agenda/agende', 'm', [t('agenda', 'agende', 'f')], [t('roadmap temporale', 'roadmap temporali', 'f')], 'Calendar'),
    N('cosa/cose', 'f', [t('topic', 'topic', 'm'), t('punto', 'punti', 'm')], [t('tema', 'temi', 'm'), t('ambito', 'ambiti', 'm')], 'Topics', true),
    N('fornitore/fornitori', 'm', [t('vendor', 'vendor', 'm')], [t('partner della supply chain', 'partner della supply chain', 'm')], 'Procurement'),
    N('magazzino/magazzini', 'm', [t('warehouse', 'warehouse', 'm')], [t('hub logistico', 'hub logistici', 'm')], 'Logistics'),
    N('stipendio/stipendi', 'm', [t('RAL', 'RAL', 'f')], [t('pacchetto retributivo', 'pacchetti retributivi', 'm')], 'Compensation'),
    N('aumento/aumenti', 'm', [t('upgrade della RAL', 'upgrade della RAL', 'm')], [t('revisione del pacchetto retributivo', 'revisioni del pacchetto retributivo', 'f')], 'Compensation'),
    N('colloquio/colloqui', 'm', [t('one-to-one', 'one-to-one', 'm')], [t('momento di confronto individuale', 'momenti di confronto individuale', 'm')], 'HR'),
    N('corso/corsi|formazione/formazioni', 'm', [t('training', 'training', 'm')], [t('percorso di upskilling', 'percorsi di upskilling', 'm')], 'Learning'),
    N('vendita/vendite', 'f', [t('sale', 'sales', 'f')], [t('performance commerciale', 'performance commerciali', 'f')], 'Sales'),
    N('chiamata/chiamate|telefonata/telefonate', 'f', [t('call', 'call', 'f')], [t('touchpoint vocale', 'touchpoint vocali', 'm')], 'Engagement', true),
    N('firma/firme', 'f', [t('sign-off', 'sign-off', 'm')], [t('ratifica formale', 'ratifiche formali', 'f')], 'Approval', true),
    N('consegna/consegne', 'f', [t('delivery', 'delivery', 'f')], [t('rilascio del deliverable', 'rilasci dei deliverable', 'm')], 'Delivery', true),
    N('controllo/controlli', 'm', [t('check', 'check', 'm')], [t('presidio di verifica', 'presidi di verifica', 'm')], 'Quality', true),
    N('allegato/allegati', 'm', [t('attachment', 'attachment', 'm')], [t('dotazione documentale', 'dotazioni documentali', 'f')], 'Document'),
    N('sito/siti', 'm', [t('sito', 'siti', 'm'), t('landing', 'landing', 'f')], [t('touchpoint digitale', 'touchpoint digitali', 'm')], 'Digital'),
    N('ritardo/ritardi', 'm', [t('slittamento', 'slittamenti', 'm'), t('delay', 'delay', 'm')], [t('scostamento dalla timeline', 'scostamenti dalla timeline', 'm')], 'Timeline', true)
  ];

  NOUNS.push(
    N('persona/persone|dipendente/dipendenti|lavoratore/lavoratori|impiegato/impiegati', 'f', [t('risorsa', 'risorse', 'f')], [t('risorsa', 'risorse', 'f'), t('figura professionale', 'figure professionali', 'f'), t('stakeholder', 'stakeholder', 'm')], 'People'),
    N('licenziamento/licenziamenti', 'm', [t('riorganizzazione', 'riorganizzazioni', 'f')], [t('riorganizzazione delle sinergie', 'riorganizzazioni delle sinergie', 'f'), t('ottimizzazione del perimetro', 'ottimizzazioni del perimetro', 'f')], 'People Transformation'),
    N('sala riunioni/sale riunioni', 'f', [t('meeting room', 'meeting room', 'f')], [t('hub di convergenza', 'hub di convergenza', 'm'), t('spazio di co-creazione', 'spazi di co-creazione', 'm')], 'Facilities'),
    N('macchinetta del caffè/macchinette del caffè|macchinetta/macchinette', 'f', [t('coffee corner', 'coffee corner', 'm')], [t('hub informale di networking', 'hub informali di networking', 'm')], 'Coffee'),
    N('mensa/mense', 'f', [t('canteen', 'canteen', 'f')], [t('hub conviviale', 'hub conviviali', 'm')], 'Lunch'),
    N('stagista/stagisti', 'm', [t('junior', 'junior', 'm')], [t('talento emergente', 'talenti emergenti', 'm')], 'Talent')
  );
  for (const e of NOUNS) if (['problema', 'errore', 'ritardo'].includes(e.forms[0][0])) e.key.push(t('challenge', 'challenge', 'f'));

  /* ---------- dati: espressioni fisse ---------- */
  const X = (src, off, key, en) => ({ src, off, key, en });
  const EXPR = [
    X('il prima possibile|prima possibile|appena possibile|al più presto', ['ASAP', 'appena ho bandwidth'], ['con priorità esecutiva immediata', 'compatibilmente con la roadmap']),
    X('subito', ['ASAP', 'al volo', 'in real time'], ['con un time-to-market immediato', 'in modalità fast track']),
    X('oggi', ['entro EOD', 'in giornata'], ['entro la chiusura della giornata operativa', 'nel corrente ciclo operativo']),
    X('domani', ['domani', 'entro domani EOD'], ['nella prossima finestra operativa', 'entro la giornata di domani']),
    X('dopo|più tardi', ['offline', 'in un secondo momento'], ['in una fase successiva', 'a valle del processo']),
    X('in futuro|prossimamente', ['a tendere'], ['a tendere', 'in una prospettiva di lungo periodo']),
    X('insieme', ['in sinergia', 'in team'], ['in logica di co-creazione', 'facendo sinergia']),
    X('velocemente|in fretta', ['in modalità quick', 'al volo'], ['in modalità agile', 'con un approccio lean']),
    X('veloce', ['quick', 'al volo'], ['agile', 'lean']),
    X('la settimana prossima|la prossima settimana|settimana prossima', ['in settimana prossima', 'next week'], ['nel prossimo sprint', 'nella prossima finestra settimanale']),
    X('importante|importanti', ['top priority', 'high priority'], ['mission-critical', 'core']),
    X('urgente|urgenti', ['urgent', 'top priority'], ['ad alta priorità esecutiva', 'mission-critical']),
    X('va bene|d’accordo|d\'accordo|ok', ['ok, ci sta', 'top', 'perfetto, allineati'], ['ricevuto, procediamo in piena convergenza', 'condivido pienamente la direzione']),
    X('grazie', ['thanks', 'grazie, top'], ['ringrazio per il prezioso contributo', 'grato per la sinergia']),
    X('forse', ['potenzialmente', 'TBC'], ['in uno scenario ancora da validare', 'in via preliminare']),
    X('sempre', ['by default', 'sempre'], ['in modo strutturale', 'in maniera sistemica']),
    X('per favore|per piacere', ['please', 'se riesci'], ['laddove possibile', 'compatibilmente con le priorità']),
    X('ciao', ['hi all', 'ciao a tutti'], ['buongiorno a tutti gli stakeholder', 'un saluto a tutto il network']),
    X('scusa|scusate|scusami', ['sorry', 'my bad'], ['mi scuso per il disallineamento', 'riconosco l’area di miglioramento']),
    X('in ritardo', ['fuori timeline', 'in late'], ['in disallineamento rispetto alla timeline', 'fuori dal perimetro temporale']),
    X('in tempo|per tempo', ['on time', 'entro la deadline'], ['nel rispetto della timeline', 'in linea con le milestone']),
    X('stanco|stanca|stanchi|stanche', ['a corto di bandwidth', 'un po’ scarico'], ['in fase di esaurimento delle risorse cognitive', 'in riserva energetica']),
    X('troppo lavoro|tanto lavoro|un sacco di lavoro', ['un backlog infinito', 'zero bandwidth'], ['un carico operativo non sostenibile', 'una saturazione della capacità produttiva']),
    X('in ferie', ['OOO', 'in ferie (OOO)'], ['in disconnessione strategica', 'in fase di rigenerazione']),
    X('in riunione', ['in call', 'in meeting'], ['in sessione di allineamento', 'impegnato in un momento di convergenza']),
    X('da casa', ['in smart working', 'in remote'], ['in modalità ibrida', 'da remoto, in piena continuità operativa']),
    X('una cosa', ['un topic', 'un punto'], ['un tema', 'un ambito di attenzione'])
  ];

  EXPR.push(
    X('un bell\'ordine|un bel ordine|un grande ordine|un ordine importante|un ordine', ['un bel closing', 'un PO interessante'], ['un closing da record', 'un win commerciale ad alto impatto'], 'Sales'),
    X('ciao ragazzi|ciao a tutti|ciao team|ciao raga|buongiorno a tutti', ['Hi team', 'Ciao team'], ['Dear team', 'Buongiorno a tutto il team', 'Hello stakeholder']),
    X('domani mattina|domattina', ['domani in mattinata', 'domani early morning'], ['nella prossima finestra mattutina', 'domattina, nello slot early bird']),
    X('dieci minuti|cinque minuti|due minuti|un attimo', ['per un quick slot', 'dieci minuti, giuro'], ['per uno slot da dieci minuti (sessanta effettivi)', 'per un time-box ultra lean']),
    X('chi fa cosa', ['chi ha l’ownership di cosa', 'la RACI'], ['la matrice RACI delle responsabilità', 'l’allocazione end-to-end delle ownership']),
    X('perché', ['perché'], ['in quanto', 'dal momento che']),
    X('già', ['già', 'ormai'], ['strutturalmente', 'già']),
    X('ragazzi|gente', ['team', 'gente'], ['team', 'talenti']),
    X('stasera|entro stasera|entro fine giornata', ['entro EOD'], ['entro EOD, in modalità ASAP', 'entro EOD']),
    X('per tua informazione|per conoscenza', ['FYI'], ['FYI', 'FYI, in ottica di trasparenza']),
    X('in lavorazione|in corso', ['WIP'], ['in WIP', 'in fase di WIP']),
    X('fine settimana|entro venerdì', ['EOW'], ['entro EOW', 'entro la milestone di EOW'])
  );
  for (const e of EXPR) {
    if (/^(?:subito|il prima possibile)/.test(e.src)) e.key.push('ASAP', 'in modalità ASAP');
    if (/^oggi/.test(e.src)) e.key.push('entro EOD');
  }

  /* ---------- frasi intere (le più comuni in ufficio) ---------- */
  const R = (re, off, key, en) => ({ re: new RegExp('^(?:' + re + ')$', 'iu'), off, key, en });
  const RULES = [
    R('(?:io )?(?:(?:mi occupo di|devo|vado a) fare (?:le |delle )?fotocopie|faccio (?:le |delle )?fotocopie|fare (?:le )?fotocopie)',
      ['Mi occupo del workflow delle fotocopie, con ownership su fronte-retro e toner.', 'Gestisco la delivery delle fotocopie. Le graffette restano out of scope.', 'Ho l’ownership del processo copie, dal fronte-retro al cambio toner.'],
      ['Coordino la riproduzione analogica di materiali strategici, con presidio del ciclo fronte-retro e dei livelli di toner.', 'Presidio la duplicazione documentale su supporto cartaceo, con una roadmap dedicata alla scalabilità del fronte-retro.', 'Guido la trasformazione analogica dei contenuti aziendali, garantendo continuità del toner end-to-end.'], 'Copy'),
    R('.*(?:riunione|call|meeting).*(?:poteva|potevano|bastava|bastavano|poteva essere|potevano essere).*(?:mail|email|e-mail|messaggio)|(?:bastava|poteva bastare) una (?:mail|email|e-mail)',
      ['Forse bastava un update asincrono. Lo segno come learning.', 'Per la prossima volta propongo un recap via mail. Tutti in copia, zero call.', 'Call utile, ma il deliverable poteva viaggiare in una mail. Feedback welcome.'],
      ['Propongo di migrare il format di allineamento sincrono verso un deliverable asincrono a bassa intensità di calendario.', 'Abbiamo individuato un’importante opportunità di efficientamento: una mail al posto di un meeting.', 'Questa sessione ci ha insegnato che la vera innovazione, a volte, è scrivere una mail.'], 'Meeting'),
    R('(?:non (?:ho|abbiamo) tempo|non ce la faccio|sono (?:pieno|piena|pieni) di (?:cose|lavoro))',
      ['Al momento sono a zero bandwidth. Possiamo riprioritizzare?', 'Sono a capacity. Facciamo un check sulle priorità?', 'Ho il backlog pieno. Se è urgent, qualcosa va droppato.'],
      ['La mia capacità operativa risulta integralmente allocata. Propongo una revisione del portafoglio delle priorità.', 'L’agenda ha raggiunto la piena saturazione. Per accogliere questa priorità occorre declassarne formalmente un’altra.', 'Sto operando al massimo della mia bandwidth strategica. Ogni nuova iniziativa richiede un trade-off consapevole.'], 'Time Management'),
    R('(?:non (?:lo )?so|non (?:ne )?ho idea|boh)',
      ['Mi serve un check prima di darti un feedback.', 'Ci devo fare un deep dive. Ti aggiorno appena ho visibilità.', 'Al momento è TBD. Lo metto tra gli action item.'],
      ['Il quadro informativo è in fase di consolidamento. Seguirà una valutazione quando avremo visibilità sul perimetro.', 'La definizione di una posizione è subordinata al completamento della ricognizione informativa.', 'Preferisco non anticipare conclusioni prima di aver raccolto tutti gli insight necessari.'], 'Insight'),
    R('(?:ne (?:parliamo|riparliamo) (?:dopo|più tardi|un’altra volta|un\'altra volta|domani)|rimandiamo(?: la discussione| il discorso)?)',
      ['Mettiamolo nel parking lot e lo riprendiamo next week.', 'Lo parcheggio per ora. Lo riprendiamo nel prossimo sync.', 'Lo teniamo offline e torniamo sul punto quando abbiamo più contesto.'],
      ['Propongo di sospendere il confronto e riposizionarlo nella prossima finestra decisionale.', 'Il tema resta nel perimetro strategico. La data di rientro nel calendario è da definire.', 'Collochiamo il punto in un parking lot evolutivo, in attesa di maggiore maturità del contesto.'], 'Alignment'),
    R('(?:nessuno (?:mi |ci )?(?:ha risposto|risponde)|non (?:mi |ci )?(?:ha|hanno) risposto(?: nessuno)?)',
      ['Faccio un follow-up e pingo chi era in copia.', 'Zero feedback per ora. Rilancio il thread con un reminder.', 'Silenzio radio sul thread. Riprovo con l’oggetto in maiuscolo.'],
      ['Il primo ciclo di consultazione si è concluso senza riscontri. Attivo una seconda tornata di coinvolgimento.', 'Il silenzio degli stakeholder richiede un ulteriore ciclo di comunicazione, questa volta con oggetto in maiuscolo.', 'Registro un engagement sotto le aspettative. Avvio un piano di riattivazione del thread.'], 'Follow-up'),
    R('(?:manca l[\'’]allegato|hai dimenticato l[\'’]allegato|ti sei dimenticat[oa] l[\'’]allegato|non c[\'’]è l[\'’]allegato)',
      ['Quick check: manca l’allegato. Me lo puoi forwardare?', 'Abbiamo un blocker sul file: non è allegato. Puoi fare un resend?', 'Mail ricevuta, attachment no. Mi fai un re-send quando riesci?'],
      ['Il processo di trasmissione si è concluso senza il relativo deliverable documentale. Si richiede la reintegrazione dell’allegato.', 'È emerso un disallineamento tra il testo della mail e la dotazione documentale effettivamente ricevuta.', 'Il valore annunciato nel corpo della mail non trova riscontro negli asset allegati.'], 'Document'),
    R('(?:fissiamo|organizziamo|programmiamo|facciamo) (?:una )?(?:riunione|call)',
      ['Scheduliamo un sync. Mando un invite.', 'Fissiamo una call: pingo il team per trovare uno slot.', 'Mando un invite da trenta minuti. Diventeranno sessanta.'],
      ['Avviamo una sessione plenaria per convergere su obiettivi, responsabilità e disponibilità di calendario.', 'Propongo di istituire un tavolo di coordinamento. Il primo punto all’ordine del giorno sarà trovare un orario.', 'Attiviamo un momento di convergenza interfunzionale, preceduto da un pre-allineamento.'], 'Meeting'),
    R('(?:ci vuole troppo tempo|ci (?:sto|stiamo) mettendo troppo|è troppo lento|va a rilento)',
      ['È più time-consuming del previsto. Facciamo un check sul bottleneck.', 'Rivediamo l’ETA: questo task sta assorbendo troppa bandwidth.', 'Siamo fuori timeline. Serve un quick win per sbloccare.'],
      ['Il tempo di esecuzione ha superato la capacità di assorbimento prevista. Occorre individuare il collo di bottiglia.', 'L’avanzamento registra uno scostamento temporale. Apriamo un tavolo per misurare quanto tempo ci sta facendo perdere.', 'La velocity del progetto richiede una ricalibrazione strutturale della timeline.'], 'Timeline'),
    R('(?:è una (?:cosa )?facile|è facile|ci vogliono due minuti|si fa in due minuti|è una cavolata)',
      ['È un quick win. Lo chiudiamo in due minuti, agenda permettendo.', 'Low-hanging fruit: mettiamolo in cima al backlog.', 'Easy. Basta allinearci su chi lo fa.'],
      ['Abbiamo individuato un’opportunità ad alto ritorno e bassissimo assorbimento di risorse: due minuti netti.', 'L’intervento offre un rapporto eccezionale tra impatto e complessità. Resta da convocare il kick-off.', 'Siamo di fronte a un classico low-hanging fruit, che richiederà comunque tre riunioni.'], 'Quick Wins'),
    R('(?:la stampante non funziona|si è rotta la stampante|la stampante è rotta|la stampante si è inceppata)',
      ['Abbiamo un blocker sulla stampante. Chi prende in carico il ticket?', 'La printer è offline. Serve un workaround.', 'Stampante down. Apro un ticket e intanto stampo al secondo piano.'],
      ['Si è verificata un’interruzione del servizio di produzione documentale. La continuità del business è affidata alla stampante del secondo piano.', 'Il presidio di stampa presenta una criticità operativa. Attivo un percorso di escalation per ripristinare il fronte-retro.', 'L’infrastruttura di output cartaceo è in fase di indisponibilità non pianificata.'], 'Printing'),
    R('(?:(?:mi serve|ci serve|ho bisogno di) (?:un )?caff[eè]|(?:vado a|vado a prendere|prendo|mi prendo|andiamo a prendere) (?:un )?caff[eè])',
      ['Faccio un coffee break e torno operativo.', 'Mi prendo un quick break. Torno online in cinque minuti.', 'Refill di caffeina in corso. Back in 5.'],
      ['Avvio un intervento mirato di ripristino della capacità operativa mediante integrazione di caffeina.', 'Programmo un breve ciclo di ricarica per sostenere la continuità della performance cognitiva.', 'Mi concedo un momento di networking informale presso l’hub della macchinetta.'], 'Coffee'),
    R('(?:(?:domani |da domani )?(?:vado|sono|sarò) in ferie(?: da domani)?)',
      ['Sarò OOO. Per urgenze, ma solo vere, scrivete al backup.', 'Vado OOO: autoreply attivo, Teams silenziato.', 'Stacco per qualche giorno. Il backlog mi aspetta, purtroppo.'],
      ['Avvio un periodo di disconnessione strategica per rigenerare la mia capacità di generare valore.', 'Investo nel mio work-life balance. Tornerò con una visione ancora più chiara.', 'Attivo una fase di recovery pianificata, a beneficio della sostenibilità del team.'], 'Wellbeing'),
    R('(?:vado|andiamo) a (?:pranzo|mangiare)',
      ['Faccio lunch. Back in un’ora, forse.', 'Lunch break: torno online alle 14.', 'Vado a fare lunch, se serve pingatemi.'],
      ['Mi assento per un momento conviviale di networking, fondamentale per la cultura aziendale.', 'Avvio una pausa di ricarica energetica, propedeutica alla performance pomeridiana.', 'Partecipo a un informale lunch & learn, senza learn.'], 'Lunch'),
    R('(?:sono in ritardo|arrivo tardi|faccio tardi)',
      ['Sono leggermente fuori timeline. ETA dieci minuti.', 'Running late: iniziate pure, mi allineo al volo.', 'Piccolo delay. Joino appena posso.'],
      ['Registro uno scostamento temporale rispetto alla pianificazione. La mia ETA è in fase di ridefinizione.', 'Il mio ingresso in sessione subirà un lieve riposizionamento temporale.', 'Sto ricalibrando la mia presenza in funzione delle variabili di traffico.'], 'Timeline'),
    R('(?:ho sbagliato|ho fatto un errore|è colpa mia|ho fatto un casino)',
      ['My bad. Lo fixo ASAP.', 'C’è un bug ed è mio. Patcho entro EOD.', 'Ownership totale sull’errore. Fix in arrivo.'],
      ['Ho vissuto una preziosa opportunità di apprendimento, che condividerò con il team.', 'Mi assumo piena ownership dello scostamento e lo trasformo in un learning per tutta l’organizzazione.', 'L’errore è solo una tappa del mio percorso di crescita. Tre cose che ho imparato.'], 'Learning'),
    R('(?:non è (?:compito|lavoro) mio|non è il mio lavoro|non è di mia competenza|non mi compete)',
      ['Questo è out of scope per me. Ti giro il contatto giusto.', 'Non è nel mio perimetro: escalo a chi ha l’ownership.', 'Tecnicamente non è un mio task, ma ti metto in copia chi se ne occupa.'],
      ['L’attività esula dal perimetro del mio mandato. Propongo di indirizzarla verso lo stakeholder di competenza.', 'Si tratta di un tema che merita un owner dedicato, che al momento non coincide con me.', 'Valorizzo la richiesta e la ricolloco nel corretto perimetro organizzativo.'], 'Governance'),
    R('(?:chi (?:l[\'’]ha|lo ha|ha) deciso|chi ha preso (?:questa|la) decisione)',
      ['Chi è il decision maker su questo punto?', 'Mi manca un po’ di contesto: chi ha l’ownership della decisione?', 'Domanda tecnica: dove è stata presa questa call?'],
      ['Sarebbe utile mappare con chiarezza la governance decisionale alla base di questa scelta.', 'Propongo di ricostruire la catena delle responsabilità che ha generato questo orientamento.', 'Quale stakeholder ha esercitato la leadership su questa direzione strategica?'], 'Governance'),
    R('(?:(?:oggi )?(?:lavoro|sono) (?:da casa|in smart working)(?: oggi)?)',
      ['Oggi sono in smart working, raggiungibile su Teams.', 'Remote day: telecamera off, produttività on.', 'Lavoro da remoto oggi. Pallino verde garantito.'],
      ['Oggi presidio le attività in modalità ibrida, in piena continuità operativa.', 'Abilito un modello di lavoro distribuito, con l’obiettivo di massimizzare il focus.', 'Opero da remoto, perché il valore non ha un indirizzo fisso.'], 'Remote Work'),
    R('(?:(?:devo |adesso |ora )?(?:rispondo|rispondere) alle (?:e-?mail|mail)|(?:devo )?(?:controllare|controllo|leggo|leggere) le (?:e-?mail|mail))',
      ['Faccio un check della inbox e chiudo i thread aperti.', 'Inbox zero mode: rispondo a tutto entro EOD.', 'Smaltisco il backlog delle mail, poi sono tutto vostro.'],
      ['Presidio il flusso comunicativo asincrono, con l’obiettivo di azzerare il debito informativo.', 'Avvio un ciclo di gestione strutturata della corrispondenza digitale.', 'Mi dedico alla governance della inbox, primo touchpoint di ogni relazione professionale.'], 'Inbox'),
    R('(?:ho finito(?: il lavoro| tutto)?|ho completato tutto|fatto)',
      ['Task chiuso. Lo segno come done.', 'Deliverable consegnato. Next.', 'Tutto chiuso, ti mando un recap.'],
      ['Ho portato a compimento il deliverable, generando valore misurabile per tutti gli stakeholder.', 'La milestone è stata raggiunta con successo. Sono grato al team per il supporto.', 'Un altro traguardo raggiunto. Ma il viaggio, come sempre, continua.'], 'Delivery'),
    R('(?:il wi-?fi non (?:va|funziona)|internet non (?:va|funziona)|non (?:va|funziona) (?:il wi-?fi|internet)|la connessione non va)',
      ['Ho un problema di connettività. Mi sentite?', 'Wi-fi down. Joino dal telefono.', 'Sono offline mio malgrado. Apro un ticket all’IT.'],
      ['Stiamo affrontando una discontinuità nell’infrastruttura di connettività che impatta il flusso operativo.', 'La rete presenta criticità di performance. Attivo un piano di continuità tramite hotspot.', 'Il mio accesso all’ecosistema digitale è temporaneamente compromesso.'], 'Digital'),
    R('(?:sono (?:stanco|stanca|distrutto|distrutta|cotto|cotta)|non ne posso più)',
      ['Sono un po’ scarico. Oggi bandwidth ridotta.', 'Batteria al 10%. Mi serve un break.', 'Sono cotto, ma sul pezzo.'],
      ['Sto attraversando una fase di riduzione della capacità energetica, che gestirò con resilienza.', 'Le mie risorse cognitive richiedono un ciclo di rigenerazione strategica.', 'Oggi la mia performance è in modalità risparmio energetico, ma l’ownership resta piena.'], 'Wellbeing'),
    R('(?:(?:io )?(?:vado a casa|stacco|me ne vado|esco)(?: adesso| ora)?)',
      ['Stacco per oggi. Se serve, domani mattina sono online.', 'Logging off. Ci sentiamo domani.', 'Chiudo il laptop. Teams resta, purtroppo, sul telefono.'],
      ['Chiudo la giornata operativa, nel rispetto di un sano work-life balance.', 'Disattivo la presenza on site per tutelare la sostenibilità della mia performance.', 'Concludo il ciclo produttivo odierno. Domani si riparte con una visione rinnovata.'], 'Work-Life Balance'),
    R('(?:ci (?:vediamo|sentiamo) domani|(?:possiamo|ci possiamo) (?:sentirci|sentire|vederci|vedere|parlarne) domani)',
      ['Domani ci facciamo una call veloce?', 'Ci sentiamo domani per un quick sync.', 'Domani mattina un check di dieci minuti?'],
      ['Propongo una finestra di confronto sincrono nella giornata di domani, compatibilmente con le agende degli stakeholder.', 'Possiamo aprire un checkpoint domani per condividere le evidenze e convergere sui prossimi step?', 'Domani attiviamo un momento di convergenza per consolidare quanto emerso.'], 'Alignment'),
    R('(?:grazie(?: a tutti| mille| di tutto)?)',
      ['Thanks a tutti, top.', 'Grazie a tutti per il supporto!', 'Thank you all, team pazzesco.'],
      ['Desidero ringraziare tutti gli stakeholder per il prezioso contributo a questo percorso.', 'Gratitudine. Questa è la parola che oggi guida il mio mindset.', 'Nulla di tutto questo sarebbe stato possibile senza un team straordinario.'], 'Gratitude'),
    R('(?:il cliente è (?:arrabbiato|furioso|incazzato|scontento)|il cliente si è lamentato)',
      ['Il customer ha qualche pain point. Facciamo un quick call?', 'Abbiamo un cliente escalato. Serve un piano d’azione entro EOD.', 'Il cliente è poco happy. Prepariamo una risposta allineata.'],
      ['Abbiamo ricevuto un feedback particolarmente sfidante dallo stakeholder esterno, che rappresenta un’opportunità di miglioramento.', 'La customer experience presenta un’area di attenzione che richiede un presidio immediato.', 'Il partner ha espresso un livello di engagement emotivo superiore alle attese.'], 'Customer'),
    R('(?:(?:devo |dobbiamo )?(?:fare|preparare) (?:una |la |le )?(?:presentazione|slide))',
      ['Devo buildare un deck. Mi serve un template.', 'Preparo le slide, poi facciamo una review.', 'Altra presentazione: trenta slide, di cui ventotto di contesto.'],
      ['Sto costruendo uno storytelling ad alto impatto per ingaggiare il management.', 'Orchestro una narrazione visiva che renda tangibile la nostra visione.', 'Sviluppo un deck strategico in cui ogni slide è un’opportunità di generare valore.'], 'Storytelling'),
    R('(?:(?:devo )?(?:aggiornare|aggiorno|compilare|compilo) (?:il )?(?:file )?excel|(?:(?:devo|mi occupo di) (?:inserire|caricare|copiare)|(?:inserisco|carico|copio)) (?:i |dei )?dati (?:su|in) excel)',
      ['Mi occupo del data entry su Excel. Poi faccio un check sulle celle vuote.', 'Updato il foglio dei KPI, colonna per colonna.', 'Gestisco il flusso di aggiornamento del file Excel, con ownership sulle colonne.'],
      ['Presidio la strutturazione del patrimonio informativo aziendale in ambiente tabellare.', 'Coordino l’integrazione dei dati in un’infrastruttura tabellare. La scalabilità è garantita trascinando la formula verso il basso.', 'Governo l’evoluzione del cruscotto dei dati, cella dopo cella.'], 'Spreadsheet'),
    R('(?:(?:il mio capo|il capo|il manager) non (?:capisce niente|ha capito|capisce))',
      ['Forse c’è un disallineamento con il management. Facciamo un recap?', 'Il boss non ha ancora tutto il contesto. Gli mando un one-pager.', 'Serve un walkthrough per il manager, con meno testo e più grafici.'],
      ['Esiste un’opportunità di rafforzare l’allineamento tra visione operativa e visione direzionale.', 'Il management potrebbe beneficiare di una helicopter view più strutturata.', 'Propongo un percorso di onboarding sul tema dedicato alla leadership.'], 'Leadership')
  ];

  /* ---------- cornici ---------- */
  const OPEN_OFF = ['Quick update:', 'Per visibilità:', 'FYI:', 'Ti giro un update veloce:', 'Ping veloce:', 'Short version:', 'Come anticipato in call:', 'Al netto di tutto:', 'Breve heads-up:', 'Spoiler dal mio backlog:', 'Ti rubo trenta secondi:', 'Giusto per chiudere il loop:', 'Senza fare spam:', 'Dal recap di stamattina:', 'Metto tutti in copia:'];
  const CLOSE_OFF = ['Ti tengo posted.', 'Fammi sapere se ci sono blocker.', 'Se serve, facciamo un quick sync.', 'Lo metto nel recap.', 'Feedback welcome.', 'Tutti in copia, così nessuno resta fuori dal loop.', 'Ti pingo se cambia qualcosa.', 'Next step: un follow-up.', 'Lo tracciamo come action item.', 'Ci aggiorniamo a valle.', 'Per ora è WIP.', 'TBC entro EOD.', 'Ne parliamo offline, se serve.', 'Lo parcheggio nel backlog.', 'Grazie in anticipo!', 'Fammi un cenno su Teams.', 'Rispondete pure a tutti.'];
  const OPEN_KEY = ['In un’ottica di creazione di valore,', 'Con una visione end-to-end,', 'In questa nuova fase di trasformazione,', 'Con grande senso di ownership,', 'Abbracciando il cambiamento,', 'Mettendo al centro le persone,', 'Con un mindset orientato all’eccellenza,', 'Oggi più che mai,', 'In un contesto sempre più sfidante,', 'Sono entusiasta di condividere che', 'Lasciatemi condividere un learning:', 'Fiero di annunciare che', 'Dopo una profonda riflessione,', 'Nel mio percorso di crescita professionale,', 'FYI, in ottica win-win,', 'Facendo squadra e sinergia,', 'A livello di helicopter view,', 'Nell’ottica di ottimizzare il ROI,', 'Al fine di massimizzare l’engagement,'];
  const CLOSE_KEY = ['Il tutto con un impatto misurabile sul medio-lungo periodo.', 'Perché il vero cambiamento parte dalle piccole cose.', 'A tendere, in modalità scalabile.', 'Un passo alla volta, verso l’eccellenza.', 'Insieme si va più lontano.', 'Grato al team per il supporto.', 'Ownership, visione, impatto.', 'Questo è il futuro del lavoro.', 'Perché i dettagli fanno la differenza.', 'Nulla accade per caso: tutto è strategia.', 'Il viaggio è appena iniziato.', 'Ne parleremo al prossimo town hall.', 'Con l’obiettivo di generare valore condiviso per tutti gli stakeholder.', 'Agree?', 'E tu, come la vedi? Scrivimelo nei commenti.', 'FYI: aggiornamento dei KPI entro EOD.', 'Status: WIP, ETA ASAP.', 'Facciamo sinergia: win-win per tutti.', 'Serve una helicopter view, ASAP.', 'Deep dive in agenda entro EOD.', 'Kick-off ASAP, ROI da definire.', 'Il target? Uscire dalla comfort zone.'];
  const CLOSE_BY_TOPIC = {
    Sales: ['Riduciamo il gap con i target aziendali.', 'Un passo concreto verso il target di fine anno.', 'La pipeline ringrazia.', 'Il forecast sorride.'],
    Meeting: ['Agenda da definire, sinergie garantite.', 'Il pre-meeting lo fissiamo a parte.'],
    Alignment: ['Agenda da definire, sinergie garantite.', 'Allineamento oggi, convergenza domani.'],
    Delivery: ['Milestone raggiunta: si punta al prossimo sprint.', 'Deliverable chiuso, ROI in arrivo.'],
    Timeline: ['Ricalibriamo la roadmap e recuperiamo il gap.', 'La timeline è viva e si evolve.'],
    'Time Management': ['La bandwidth è finita, la visione no.', 'Riprioritizziamo il backlog con coraggio.'],
    'Problem Solving': ['Ogni challenge è un’opportunità di crescita.', 'Dal pain point al quick win, insieme.'],
    Quality: ['Zero difetti, molti learning.', 'Qualità end-to-end, sempre.'],
    People: ['Le persone al centro, sempre.', 'Il capitale umano è il nostro primo asset.'],
    'People Transformation': ['Le persone al centro, sempre.', 'Una nuova fase di crescita per l’organizzazione.'],
    Coffee: ['Anche il work-life balance è un KPI.', 'La caffeina è il vero motore della trasformazione.'],
    Lunch: ['Anche il work-life balance è un KPI.', 'Il networking passa anche dalla mensa.'],
    Wellbeing: ['Anche il work-life balance è un KPI.', 'Ricaricare le energie è una scelta strategica.'],
    Planning: ['Tutto in roadmap, niente in agenda.', 'La pianificazione è già esecuzione.'],
    Document: ['Tutti in copia, nessuno escluso.', 'Il deliverable parla da solo.'],
    Communication: ['Tutti in copia, nessuno escluso.', 'Comunicare è già fare sinergia.'],
    Inbox: ['Inbox zero è uno stato mentale.', 'Tutti in copia, nessuno escluso.'],
    Engagement: ['Il touchpoint giusto fa la differenza.', 'Ingaggio alto, aspettative allineate.'],
    Customer: ['Il cliente al centro, sempre.', 'Customer first, KPI subito dopo.'],
    Leadership: ['La leadership si dimostra con l’esempio, e con le slide.', 'Il management è allineato. Più o meno.'],
    Project: ['Il progetto è una journey, non una destinazione.', 'Scope chiaro, ownership ancora da definire.']
  };
  function pickCloser(en, board) {
    const pool = en && CLOSE_BY_TOPIC[en];
    if (board && pool && chance(0.85)) return pick(pool, 'ct' + en);
    return pick(board ? CLOSE_KEY : CLOSE_OFF, board ? 'ck' : 'co');
  }
  const TITLES_OFF = ['{X} Specialist', '{X} Coordinator', 'Junior {X} Owner', '{X} Lead', '{X} Champion', 'Senior {X} Associate'];
  const TITLES_KEY = ['Chief {X} Officer', 'Global Head of {X} Excellence', 'VP of {X} Transformation', '{X} Evangelist', 'Senior Director, {X} Strategy', 'Head of {X} & Synergies'];
  const DEFAULT_X = ['Synergy', 'Alignment', 'Workflow', 'Value Creation', 'Stakeholder Engagement', 'Change'];

  /* ---------- costruzione regex ---------- */
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, AP);
  const PERSONS = [0, 1, 2, 3, 4, 5, 6, 7];

  const verbForms = new Map(); // forma -> {entry, p}
  for (const e of VERBS) for (const src of e.src) {
    verbForms.set(src, { e, p: -1 });
    for (const p of PERSONS) { const f = conj(src, p); if (!verbForms.has(f)) verbForms.set(f, { e, p }); }
  }
  const verbRe = new RegExp(B0 + '(' + [...verbForms.keys()].sort((a, b) => b.length - a.length).map(esc).join('|') + ')' + B1, 'giu');

  const phrasalList = [];
  for (const e of PHRASAL) for (const base of e.base.split('|')) {
    const forms = new Map([[base, -1]]);
    for (const p of PERSONS) { const f = conj(base, p); if (!forms.has(f)) forms.set(f, p); }
    for (const [f, p] of forms) phrasalList.push({ f, p, e });
  }
  const phrasalRe = new RegExp(B0 + '(' + [...new Set(phrasalList.map(x => x.f))].sort((a, b) => b.length - a.length).map(esc).join('|') + ')\\s+(' + [...new Set(PHRASAL.map(e => e.obj))].map(o => '(?:' + o + ')').join('|') + ')' + B1, 'giu');

  const nounForms = new Map(); // forma -> {e, n}
  for (const e of NOUNS) for (const [s, p] of e.forms) {
    if (s === p) nounForms.set(s, { e, n: null }); else { nounForms.set(s, { e, n: 's' }); nounForms.set(p, { e, n: 'p' }); }
  }
  const artGroup = '(?:(' + ART_SPACED.sort((a, b) => b.length - a.length).join('|') + ')\\s+|(' + ART_ELIDED.sort((a, b) => b.length - a.length).join('|') + ')' + AP + ')';
  const nounRe = new RegExp(B0 + artGroup + '?(?:(' + POSS_FORMS.join('|') + ')\\s+)?(' + [...nounForms.keys()].sort((a, b) => b.length - a.length).map(esc).join('|') + ')' + B1, 'giu');

  const exprMap = new Map();
  for (const e of EXPR) for (const s of e.src.split('|')) exprMap.set(s.replace(/’/g, "'"), e);
  const exprRe = new RegExp(B0 + '(' + [...exprMap.keys()].sort((a, b) => b.length - a.length).map(esc).join('|') + ')' + B1, 'giu');

  const HOMOGRAPHS = new Set(['acquisti', 'ordini', 'firma', 'firme', 'controllo', 'controlli', 'consegna', 'consegne', 'copia', 'copie', 'lavoro', 'lavori', 'prova', 'prove', 'ordine', 'risposta', 'domanda', 'domande', 'pausa', 'invio', 'invii', 'aiuto', 'cambio', 'ritardo', 'ritardi', 'stampa', 'stampe', 'chiamata', 'cerca', 'gestione', 'sistema', 'spesa', 'conto', 'conti', 'pranzo', 'giro']);
  const NOUN_ONLY_HOMOGRAPHS = new Set(['acquisti', 'ordini', 'ordine', 'firma', 'firme', 'consegna', 'consegne', 'copia', 'copie', 'lavori', 'prova', 'prove', 'risposta', 'domanda', 'domande', 'pausa', 'ritardo', 'ritardi', 'stampa', 'stampe', 'conti', 'conto']);
  const DETERMINERS = new Set([...ART_SPACED, ...POSS_FORMS, 'questo', 'questa', 'questi', 'queste', 'quello', 'quella', 'quei', 'quelle', 'quegli', 'tutto', 'tutti', 'tutte', 'tutta', 'qualche', 'ogni', 'alcuni', 'alcune', 'due', 'tre', 'quattro', 'cinque', 'dieci', 'cento', 'mille', 'molti', 'molte', 'tanti', 'tante', 'pochi', 'poche', 'nuovo', 'nuova', 'nuovi', 'nuove', 'vecchio', 'vecchia', 'altro', 'altra', 'altri', 'altre']);

  /* ---------- traduzione ---------- */
  function capFirst(s) { return s ? s[0].toLocaleUpperCase('it') + s.slice(1) : s; }
  function lowFirst(s) { return s && !/^\p{Lu}{2}/u.test(s) && !/^(?:Excel|Teams|KPI|ASAP|OOO|FYI|ETA)\b/.test(s) ? s[0].toLocaleLowerCase('it') + s.slice(1) : s; }
  function keepCase(src, out) { return /^\p{Lu}/u.test(src) ? capFirst(out) : out; }

  function nextWord(text, end) {
    const m = /^[\s]*([\p{L}'’\d]+)/u.exec(text.slice(end));
    return m ? m[1].toLocaleLowerCase('it').replace(/’/g, "'") : '';
  }
  function prevWord(text, start) {
    const m = /([\p{L}'’]+)\s*$/u.exec(text.slice(0, start));
    return m ? m[1].toLocaleLowerCase('it').replace(/’/g, "'") : '';
  }
  const isPrep = s => /\s(?:su|di|a|per|con|in|da)$/.test(s);
  function chooseTarget(list, hasObj, poolKey) {
    let pool;
    if (hasObj) pool = list.filter(x => !x.startsWith('!'));
    else pool = list.filter(x => !isPrep(x));
    if (!pool.length) return null;
    return pick(pool, poolKey, 2).replace(/^!/, '');
  }

  function mulberry32(a) {
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  function norm(s) { return String(s).toLocaleLowerCase('it').replace(/’/g, "'").replace(/\s+/g, ' ').replace(/[.!?…]+$/u, '').trim(); }
  // Con un seed il risultato è deterministico: il server può ricalcolarlo per validare i voti.
  function translate(input, mode = 'board', opts = {}) {
    if (opts.seed == null) return translateMulti(input, mode);
    for (const k in recent) delete recent[k];
    rnd = mulberry32(opts.seed >>> 0);
    try { return Object.assign(translateMulti(input, mode), { seed: opts.seed >>> 0 }); }
    finally { rnd = Math.random; for (const k in recent) delete recent[k]; }
  }
  const GREETING = /^(?:\u0003?)(?:ciao|buongiorno|buonasera|salve|hey|ehi|hi|hello|dear|gentil)/i;
  function translateMulti(input, mode) {
    const text = String(input).replace(/\s+/g, ' ').trim();
    const parts = text.split(/(?<=[.!?…])\s+(?=\S)/u).filter(Boolean);
    if (parts.length < 2) return translateCore(text, mode, true);
    const board = mode === 'board';
    const res = parts.map(p => translateCore(p, mode, false));
    const segs = [];
    res.forEach((r, i) => { if (i) segs.push({ t: ' ' }); segs.push(...r.segments.map(x => ({ ...x }))); });
    const first = segs[0];
    if (first && !GREETING.test(first.t) && chance(board ? 0.6 : 0.4)) {
      const opener = pick(board ? OPEN_KEY : OPEN_OFF, board ? 'ok' : 'oo');
      if (!/^\p{Lu}{2}/u.test(first.t)) first.t = first.t[0].toLocaleLowerCase('it') + first.t.slice(1);
      segs.unshift({ t: opener + ' ' });
    }
    const closer = pickCloser(res.map(r => r.en).find(Boolean), board);
    segs.push({ t: ' ' + closer });
    const plain = segs.map(x => x.t).join('');
    return { text: plain, segments: segs, score: Math.min(99, Math.max(...res.map(r => r.score)) + 4), title: res[0].title };
  }
  function translateCore(input, mode, frames = true) {
    const board = mode === 'board';
    const M = board ? 'key' : 'off';
    let text = input.replace(/\s+/g, ' ').trim();
    const endPunct = (/[.!?…]+$/u.exec(text) || [''])[0];
    let core = text.replace(/[.!?…]+$/u, '').trim();
    const norm = core.toLocaleLowerCase('it').replace(/’/g, "'").replace(/[,;:]+/g, '').trim();
    const ens = [];

    // 1. frasi intere
    const rule = RULES.find(r => r.re.test(norm));
    if (rule) {
      let out = pick(rule[M], 'rule' + RULES.indexOf(rule) + M, 2);
      if (frames && board && chance(0.35) && !/[?]$/.test(out)) out += ' ' + pickCloser(rule.en, board);
      return finish(out, [], rule.en, board, 2 + (board ? 2 : 1));
    }

    // 2. sostituzioni con segnaposto
    const slots = [];
    const put = (s, src) => { slots.push({ s, src }); return '\u0001' + (slots.length - 1) + '\u0002'; };
    let changes = 0;

    // "mi occupo di"
    core = core.replace(new RegExp(B0 + '(mi occupo|ci occupiamo|si occupa)\\s+(?:(della|dello|delle|degli|dei|del|di)(?!\\p{L})|(dell[\'’]))', 'giu'), (m, v, prep1, prep2) => {
      const prep = prep1 || prep2;
      const p = /mi/i.test(v) ? 0 : /ci/i.test(v) ? 3 : 2;
      const offList = ['avere l’ownership di', 'avere in carico il presidio di', 'essere owner di'];
      const keyList = ['detenere la responsabilità end-to-end di', 'presidiare in ottica strategica l’intero ciclo di', 'guidare con visione il perimetro di'];
      const target = conjPhrase(pick(board ? keyList : offList, 'occupo' + M, 2), p);
      changes++;
      const DMAP = { di: '', del: 'il', dello: 'lo', della: 'la', dei: 'i', degli: 'gli', delle: 'le', "dell'": "l'" };
      const restored = DMAP[prep.toLocaleLowerCase('it').replace('’', "'")] || '';
      return put(target, m) + (restored ? ' ' + restored : '');
    });

    // locuzioni verbali
    core = core.replace(phrasalRe, (m, v, obj, off, str) => {
      const vl = v.toLocaleLowerCase('it');
      const objl = obj.toLocaleLowerCase('it').replace(/’/g, "'");
      const hit = phrasalList.find(x => x.f === vl && new RegExp('^(?:' + x.e.obj + ')$', 'iu').test(objl));
      if (!hit) return m;
      ens.push(hit.e.en);
      changes += 2;
      const target = conjPhrase(pick(hit.e[M], 'pv' + PHRASAL.indexOf(hit.e) + M, 2), hit.p);
      return keepCase(m, put(target, m));
    });

    // espressioni fisse
    core = core.replace(exprRe, (m, w, off, str) => {
      const wl = w.toLocaleLowerCase('it').replace(/’/g, "'");
      const e = exprMap.get(wl);
      if (!e) return m;
      const prev = prevWord(str, off), nx = nextWord(str, off + m.length);
      if (/^(?:oggi|domani|dopo|più tardi|subito|sempre)$/.test(wl) && /^(?:a|per|entro|da|fino|di|e|o|da|tra|fra)$/.test(prev)) return m;
      if (/^(?:dopo|insieme)$/.test(wl) && nx && !/^\u0001/.test(str.slice(off + m.length).trim()) && !/^(?:e|ma|perché|quando|se|così|allora)$/.test(nx)) return m;
      changes++;
      if (e.en) ens.unshift(e.en);
      // "oggi" con un verbo al passato: niente "entro EOD"
      if (/^(?:oggi|domani)$/.test(wl) && /(?:^|\s)(?:ho|hai|ha|abbiamo|avete|hanno|sono|siamo|è)\s+\p{L}+(?:at|ut|it)[oaie](?!\p{L})/u.test(str)) return keepCase(m, put(board ? 'in data odierna' : 'oggi', m));
      return keepCase(m, put(pick(e[M], 'ex' + EXPR.indexOf(e) + M, 2), m));
    });

    // perifrasi da keynote: per -> al fine di / nell'ottica di, su -> in merito a, con -> in sinergia con
    if (board) {
      core = core.replace(new RegExp(B0 + '(per|su|con)' + B1, 'giu'), (m, w, off, str) => {
        const nx = nextWord(str, off + m.length);
        const ph = /^\u0001/.test(str.slice(off + m.length).trim());
        const det = ph || DETERMINERS.has(nx) || !!ARTS[nx] || nounForms.has(nx) || /^(?:l|un|dell)'/.test(nx);
        const wl = w.toLowerCase();
        if (wl === 'per') {
          if (/(?:are|ere|ire|arsi|ersi|irsi|armi|ermi|irmi)$/.test(nx) && chance(0.85)) { changes++; return put(pick(['al fine di', 'nell’ottica di', 'con l’obiettivo di'], 'per-inf'), m); }
          if (det && chance(0.75)) { changes++; return put(pick(['nell’ottica di', 'a livello di', 'a beneficio di'], 'per-n'), m); }
        } else if (wl === 'su' && det && chance(0.6)) { changes++; return put('in merito a', m); }
        else if (wl === 'con' && det && chance(0.45)) { changes++; return put(pick(['in sinergia con', 'in co-creazione con'], 'con'), m); }
        return m;
      });
    }

    // verbi
    core = core.replace(verbRe, (m, w, off, str) => {
      const wl = w.toLocaleLowerCase('it');
      const info = verbForms.get(wl);
      if (!info) return m;
      const prev = prevWord(str, off);
      if (HOMOGRAPHS.has(wl) && (DETERMINERS.has(prev) || ARTS[prev] || /'$/.test(prev) || NOUN_ONLY_HOMOGRAPHS.has(wl) && !/^(?:io|tu|lui|lei|noi|voi|loro|non|ti|mi|ci|vi|gli|lo|li|ne|si|che|chi)$/.test(prev))) return m;
      const nx = nextWord(str, off + m.length);
      const clitic = /^(?:lo|la|li|le|l'|ne|gli)$/.test(prev);
      const hasObj = !clitic && (DETERMINERS.has(nx) || !!ARTS[nx] || nounForms.has(nx) || /^\d/.test(nx) || /^(?:l|un|dell)'/.test(nx));
      const target = chooseTarget(info.e[M], hasObj, 'v' + VERBS.indexOf(info.e) + M + (hasObj ? 'o' : 'n'));
      if (!target) return m;
      ens.push(info.e.en);
      changes++;
      return keepCase(m, put(conjPhrase(target, info.p), m));
    });

    // nomi (con articolo e possessivo riflessi sul nuovo genere)
    core = core.replace(nounRe, (m, art, artEl, poss, noun, off) => {
      const nl = noun.toLocaleLowerCase('it');
      const info = nounForms.get(nl);
      if (!info) return m;
      const artKey = art ? art.toLocaleLowerCase('it') : artEl ? artEl.toLocaleLowerCase('it') + "'" : null;
      if (info.e.needArt && !artKey && !poss) return m;
      const a = artKey ? ARTS[artKey] : null;
      const n = info.n || (a ? a[3] : 's');
      const srcG = (a && a[2]) || info.e.g;
      const list = info.e[M];
      const same = list.filter(x => x[2] === srcG);
      const tg = pick(same.length ? same : list, 'n' + NOUNS.indexOf(info.e) + M, 2);
      const word = n === 'p' ? tg[1] : tg[0];
      let possOut = '';
      if (poss) {
        const st = possStem(poss.toLocaleLowerCase('it'));
        possOut = POSS[st][(tg[2] === 'f' ? 1 : 0) + (n === 'p' ? 2 : 0)];
      }
      const head = possOut || word;
      const artOut = a ? article(a[0], a[1], tg[2], n, head) : '';
      ens.push(info.e.en);
      changes++;
      const out = joinArt(artOut, possOut ? possOut + ' ' + word : word);
      return keepCase(m, put(out, m));
    });

    // 3. ricomposizione + preposizioni articolate
    let body = core;
    if (board) body = body.replace(/^io\s+/iu, '');
    let restored = body.replace(/\u0001(\d+)\u0002/g, (_, i) => '\u0003' + slots[+i].s + '\u0004');
    restored = contract(restored);

    // 4. cornici
    const fewChanges = changes < 2;
    let opener = '', closer = '';
    const greet = GREETING.test(restored.replace(/[\u0003\u0004]/g, ''));
    if (!frames) { /* le cornici le aggiunge translateMulti */ }
    else if (board) {
      if (!greet && chance(fewChanges ? 0.9 : 0.6)) opener = pick(OPEN_KEY, 'ok');
      closer = pickCloser(ens[0], board);
    } else {
      const o = chance(fewChanges ? 0.7 : 0.45), c = chance(fewChanges ? 0.75 : 0.45);
      if (o && !greet) opener = pick(OPEN_OFF, 'oo');
      if (c || (fewChanges && !o)) closer = pick(CLOSE_OFF, 'co');
    }
    let sentence = restored;
    const isQuestion = endPunct.includes('?');
    if (opener) sentence = opener + ' ' + lowFirstMarked(sentence);
    else sentence = capFirstMarked(sentence);
    sentence += isQuestion ? '?' : (endPunct === '!' ? '!' : '.');
    if (closer) sentence += ' ' + closer;
    return finish(sentence, null, ens[0], board, changes);
  }

  function capFirstMarked(s) { return s.replace(/^(\u0003?)(.)/su, (m, a, c) => a + c.toLocaleUpperCase('it')); }
  function lowFirstMarked(s) {
    const plain = s.replace(/[\u0003\u0004]/g, '');
    if (/^\p{Lu}{2}/u.test(plain) || /^(?:Excel|Teams|KPI|ASAP|OOO|FYI|ETA)\b/.test(plain)) return s;
    return s.replace(/^(\u0003?)(.)/su, (m, a, c) => a + c.toLocaleLowerCase('it'));
  }

  function contract(s) {
    const map = { il: 'l', lo: 'llo', la: 'lla', i: 'i', gli: 'gli', le: 'lle', "l'": "ll'" };
    const head = { di: 'de', a: 'a', da: 'da', in: 'ne', su: 'su' };
    // preposizione (anche dentro un segnaposto) + articolo
    return s.replace(new RegExp(B0 + '(di|a|da|in|su)(\\u0004?)\\s+(\\u0003?)(?:(il|lo|la|i|gli|le)(?=\\s)|(l' + AP + ')(?=\\p{L}))', 'giu'), (m, p, c1, c2, a1, a2) => {
      const al = (a1 || a2).toLowerCase().replace('’', "'");
      const out = head[p.toLowerCase()] + map[al];
      return out + c1 + c2;
    });
  }

  function finish(sentence, _unused, en, board, changes) {
    // segmenti evidenziati: \u0003 ... \u0004
    const segments = [];
    let plain = '';
    const re = /\u0003([^\u0004]*)\u0004/g;
    let pos = 0, m;
    const tidy = sentence.replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
    while ((m = re.exec(tidy))) {
      if (m.index > pos) segments.push({ t: tidy.slice(pos, m.index) });
      segments.push({ t: m[1], hl: true });
      pos = m.index + m[0].length;
    }
    if (pos < tidy.length) segments.push({ t: tidy.slice(pos) });
    plain = segments.map(s => s.t).join('');
    // evidenzia anche le buzzword già presenti (frasi intere e cornici)
    const out = [];
    for (const seg of segments) {
      if (seg.hl) { out.push(seg); continue; }
      let p = 0;
      for (const mm of seg.t.matchAll(BUZZ)) {
        if (mm.index > p) out.push({ t: seg.t.slice(p, mm.index) });
        out.push({ t: mm[0], hl: true });
        p = mm.index + mm[0].length;
      }
      if (p < seg.t.length) out.push({ t: seg.t.slice(p) });
    }
    // unisce i segmenti evidenziati adiacenti
    for (let i = out.length - 1; i > 0; i--) {
      if (out[i].hl && out[i - 1].hl) { out[i - 1].t += out[i].t; out.splice(i, 1); }
      else if (out[i].hl && out[i - 1].hl === undefined && /^\s*$/.test(out[i - 1].t) && out[i - 2]?.hl && false) { /* niente */ }
    }
    const buzz = out.filter(s => s.hl).length;
    const words = plain.split(/\s+/).length;
    const score = Math.max(41, Math.min(99, Math.round(38 + buzz * 9 + changes * 4 + (board ? 10 : 0) + Math.min(words, 30) / 3)));
    const X = en || pick(DEFAULT_X, 'dx');
    const title = pick(board ? TITLES_KEY : TITLES_OFF, board ? 'tk' : 'to').replace('{X}', X);
    return { text: plain, segments: out, score, title, en };
  }

  const BUZZ_WORDS = ['workflow', 'ownership', 'follow-up', 'delivery', 'out of scope', 'scope', 'roadmap', 'update', 'asincrono', 'recap', 'call', 'stakeholder', 'deliverable', 'checkpoint', 'KPI', 'bandwidth', 'capacity', 'deep dive', 'blocker', 'workaround', 'quick break', 'quick win', 'quick sync', 'quick check', 'sync', 'performance', 'deadline', 'milestone', 'feedback', 'parking lot', 'backlog', 'bottleneck', 'time-consuming', 'TBC', 'TBD', 'ASAP', 'ETA', 'EOD', 'OOO', 'wrap-up', 'kick-off', 'action item', 'task', 'reminder', 'thread', 'escalation', 'escalato', 'escalo', 'learning', 'mindset', 'end-to-end', 'scalabile', 'scalabilità', 'touchpoint', 'insight', 'helicopter view', 'storytelling', 'deck', 'one-pager', 'walkthrough', 'customer', 'pain point', 'engagement', 'governance', 'perimetro', 'presidio', 'presidiare', 'Presidio', 'sinergia', 'synergies', 'work-life balance', 'smart working', 'remote', 'hub', 'ecosistema', 'leadership', 'management', 'boss', 'manager', 'team', 'low-hanging fruit', 'top priority', 'urgent', 'inbox', 'data entry', 'invite', 'slot', 'break', 'coffee break', 'lunch', 'refill', 'resend', 're-send', 'attachment', 'ticket', 'printer', 'device', 'offline', 'online', 'my bad', 'fixo', 'patcho', 'fix', 'done', 'next', 'next week', 'thanks', 'top', 'happy', 'upskilling', 'velocity', 'trade-off', 'growth', 'agree', 'timeline', 'Teams', 'loop', 'heads-up', 'FYI', 'WIP', 'running late', 'joino', 'logging off', 'easy', 'build', 'buildare', 'updato', 'template', 'review', 'lunch & learn', 'town hall', 'C-level', 'decision maker', 'executive summary', 'convergenza', 'allineamento', 'allinearci', 'stato dell’arte', 'valore', 'visione', 'trasformazione', 'eccellenza', 'driver', 'brand'];
  const BUZZ = new RegExp(B0 + '(?:' + BUZZ_WORDS.sort((a, b) => b.length - a.length).map(esc).join('|') + ')' + B1, 'giu');

  /* ---------- traduttore inverso: aziendalese -> italiano umano ---------- */
  const ACRO = { asap: 'il prima possibile', fyi: 'per tua informazione', eod: 'entro stasera', eow: 'entro fine settimana', wip: 'in lavorazione', tbd: 'da decidere', tbc: 'da confermare', eta: 'orario previsto', kpi: 'numeri', roi: 'guadagno', ooo: 'fuori ufficio', mom: 'verbale', imo: 'secondo me', imho: 'secondo me', cta: 'invito all’azione' };
  const FLUFF = [
    [/in un['’]ottica di creazione di valore,?/giu, ''], [/in ottica (?:win-win|strategica|end-to-end|di flessibilità|strutturale|di trasparenza)/giu, ''],
    [/in modalità (?:scalabile|agile|lean|ASAP|fast track)/giu, ''], [/\bend-to-end\b/giu, ''], [/in piena convergenza/giu, ''],
    [/(?:nell['’]ottica|al fine|con l['’]obiettivo|a livello|a beneficio) (di|del|dello|della|dei|degli|delle|dell['’])/giu, (m, p) => 'per ' + (PREP_ART[p.toLowerCase().replace('’', "'")] || '')],
    [/in merito (a|al|allo|alla|ai|agli|alle|all['’])/giu, (m, p) => 'su ' + (PREP_ART[p.toLowerCase().replace('’', "'")] || '')],
    [/in (?:sinergia|co-creazione) con/giu, 'con'], [/procedere alla finalizzazione del processo decisionale/giu, 'decidere'],
    [/facciamo sinergia/giu, 'collaboriamo'], [/fare sinergia/giu, 'collaborare'], [/out of the box/giu, 'originale'],
    [/helicopter view/giu, 'visione d’insieme'], [/deep dive/giu, 'approfondimento'], [/win-win/giu, 'vantaggioso per tutti'],
    [/low-hanging fruit|quick win/giu, 'cosa facile'],
    [/la (?:pain point|challenge)/giu, 'il problema'], [/una challenge/giu, 'un problema']
  ];
  const PREP_ART = { di: '', del: 'il ', dello: 'lo ', della: 'la ', dei: 'i ', degli: 'gli ', delle: 'le ', "dell'": "l'", a: '', al: 'il ', allo: 'lo ', alla: 'la ', ai: 'i ', agli: 'gli ', alle: 'le ', "all'": "l'", su: '', sul: 'il ', sullo: 'lo ', sulla: 'la ', sui: 'i ', sugli: 'gli ', sulle: 'le ', "sull'": "l'" };
  const PREP_TAIL = "(?:su|sul|sullo|sulla|sui|sugli|sulle|di|del|dello|della|dei|degli|delle|a|al|allo|alla|ai|agli|alle|con|per|in)(?![" + L + "])|(?:sull|dell|all)" + AP;
  let REV = null;
  function plainOf(obj) { return obj.replace(/\(\?:([^()|]*?)(?:\|[^()]*)?\)\??/g, '$1').replace(/\s+/g, ' ').trim(); }
  function guessG(w) { return /[aà]$/.test(w) ? 'f' : 'm'; }
  function pluralize(w) { return w.split(' ').map((x, i) => i ? x : x.replace(/a$/, 'e').replace(/[oe]$/, 'i')).join(' '); }
  function buildReverse(vocab) {
    const verbs = new Map(), nouns = new Map(), plain = new Map();
    const addVerb = (target, srcPhrase) => {
      const raw = target.replace(/^!/, '');
      const prep = isPrep(raw) ? raw.split(' ').pop() : null;
      const base = prep ? raw.split(' ').slice(0, -1).join(' ') : raw;
      for (const p of [-1, 0, 1, 2, 3, 4, 5, 6, 7]) {
        const f = conjPhrase(base, p).toLocaleLowerCase('it');
        if (!verbs.has(f)) verbs.set(f, { out: conjPhrase(srcPhrase, p), prep, from: raw });
      }
    };
    for (const e of VERBS) for (const tg of [...e.key, ...e.off]) if (tg.replace('!', '') !== e.src[0]) addVerb(tg, e.src[0]);
    for (const e of PHRASAL) for (const tg of [...e.key, ...e.off]) addVerb(tg, e.base.split('|')[0] + ' ' + plainOf(e.obj));
    for (const e of NOUNS) for (const [ts, tp, tgG] of [...e.key, ...e.off]) {
      const [ss, sp] = e.forms[0];
      if (ts.toLowerCase() === ss) continue;
      if (!nouns.has(ts.toLowerCase())) nouns.set(ts.toLowerCase(), { s: ss, p: sp, g: e.g, n: ts === tp ? null : 's' });
      if (tp !== ts && !nouns.has(tp.toLowerCase())) nouns.set(tp.toLowerCase(), { s: ss, p: sp, g: e.g, n: 'p' });
    }
    for (const e of EXPR) for (const tg of [...e.key, ...e.off]) {
      const k = tg.toLocaleLowerCase('it').replace(/’/g, "'");
      const src = e.src.split('|')[0];
      if (k !== src && !plain.has(k) && !/^(?:top|ok, ci sta|ciao a tutti|sempre|domani|dopo|veloce|thanks)$/.test(k)) plain.set(k, src);
    }
    for (const v of vocab || []) {
      const plainWord = String(v.p).split(/[,/]/)[0].trim().toLocaleLowerCase('it');
      for (let term of String(v.t).split(' / ')) {
        term = term.replace(/\s*\(.*?\)\s*/g, '').trim();
        const k = term.toLocaleLowerCase('it');
        if (!k || k === plainWord || k.length < 3 || ACRO[k]) continue;
        if (v.c === 'Verbi e Azioni' && /(?:are|arsi)$/.test(k.split(' ')[0])) {
          for (const p of [-1, 0, 1, 2, 3, 4, 5, 6, 7]) {
            const f = conjPhrase(k, p);
            if (!verbs.has(f)) verbs.set(f, { out: conjPhrase(plainWord, p), prep: null, from: term });
          }
        } else if (!nouns.has(k) && !plain.has(k)) nouns.set(k, { s: plainWord, p: pluralize(plainWord), g: guessG(plainWord.split(' ')[0]), n: null });
      }
    }
    for (const k of Object.keys(ACRO)) plain.set(k, ACRO[k]);
    const alt = m => [...m.keys()].sort((a, b) => b.length - a.length).map(esc).join('|');
    REV = {
      verbs, nouns, plain,
      verbRe: new RegExp(B0 + '(' + alt(verbs) + ')' + B1 + '(?:\\s+(' + PREP_TAIL + '))?', 'giu'),
      nounRe: new RegExp(B0 + artGroup + '?(' + alt(nouns) + ')' + B1, 'giu'),
      plainRe: new RegExp(B0 + '(' + alt(plain) + ')' + B1, 'giu')
    };
  }

  function humanize(input, vocab) {
    if (!REV) buildReverse(vocab);
    let text = String(input).replace(/\s+/g, ' ').trim();
    const decoded = [];
    const slots = [];
    const put = (s, from, label) => { slots.push(s); if (from && decoded.length < 12 && !decoded.some(d => d.from.toLowerCase() === from.toLowerCase())) decoded.push({ from: from.trim(), to: (label || s).trim() }); return '\u0001' + (slots.length - 1) + '\u0002'; };
    // 1. cornici del motore e frasi di rito
    const frames = [...OPEN_KEY, ...OPEN_OFF, ...CLOSE_KEY, ...CLOSE_OFF].sort((a, b) => b.length - a.length);
    for (const f of frames) {
      const re = new RegExp(esc(f.replace(/[,:.]$/, '')) + '[,:.]?\\s*', 'giu');
      text = text.replace(re, '');
    }
    for (const [re, rep] of FLUFF) text = text.replace(re, (...a) => { const out = typeof rep === 'function' ? rep(...a) : rep; return out ? put(out, a[0]) : ''; });
    // 2. verbi (con preposizione articolata da sciogliere)
    text = text.replace(REV.verbRe, (m, v, tail) => {
      const e = REV.verbs.get(v.toLocaleLowerCase('it'));
      if (!e) return m;
      let rest = '';
      if (tail) {
        const tl = tail.toLowerCase().replace('’', "'");
        // l'articolo resta fuori dal segnaposto: così il passaggio sui nomi lo riaccorda
        rest = e.prep ? (PREP_ART[tl] ? ' ' + PREP_ART[tl].trimEnd() + (tl.endsWith("'") ? '' : ' ') : ' ') : ' ' + tail + (tl.endsWith("'") ? '' : ' ');
      }
      return put(keepCase(v, e.out), v) + (tail ? rest : '');
    });
    // 3. nomi con articolo
    text = text.replace(REV.nounRe, (m, art, artEl, noun) => {
      const e = REV.nouns.get(noun.toLocaleLowerCase('it'));
      if (!e) return m;
      const artKey = art ? art.toLocaleLowerCase('it') : artEl ? artEl.toLocaleLowerCase('it') + "'" : null;
      const a = artKey ? ARTS[artKey] : null;
      const n = e.n || (a ? a[3] : 's');
      const word = n === 'p' ? e.p : e.s;
      const outArt = a ? article(a[0], a[1], e.g, n, word) : '';
      return keepCase(m, put(joinArt(outArt, word), noun, word));
    });
    // 4. espressioni e sigle
    text = text.replace(REV.plainRe, (m, w) => {
      const out = REV.plain.get(w.toLocaleLowerCase('it').replace(/’/g, "'"));
      return out ? keepCase(m, put(out, w)) : m;
    });
    let out = text.replace(/\u0001(\d+)\u0002/g, (_, i) => slots[+i]);
    out = out.replace(/(\S)'\s+(?=\p{L})/gu, "$1'").replace(/\s+([,.;:!?])/g, '$1').replace(/([,:;])\1+/g, '$1').replace(/^[\s,;:]+/, '').replace(/\s{2,}/g, ' ').replace(/,\s*\./g, '.').trim();
    out = capFirst(out);
    if (out && !/[.!?…]$/.test(out)) out += '.';
    if (!/\p{L}/u.test(out)) out = 'Niente. Era tutta cornice.';
    const removed = Math.max(0, Math.min(95, Math.round((1 - out.length / Math.max(1, String(input).trim().length)) * 100)));
    return { text: out, decoded, removed };
  }

  const api = { translate, norm, humanize: (...a) => humanize(...a), OPEN_KEY, CLOSE_KEY, OPEN_OFF, CLOSE_OFF, PHRASAL, EXPR, conj, article, RULES, VERBS, NOUNS, _reset: () => { for (const k in recent) delete recent[k]; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Aziendalese = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* ---- AI-Lineamento. Backend (Cloudflare Pages, advanced mode) ----
   /api/top   GET  -> traduzioni più votate (usate dal motore come "scelte dalla community")
   /api/vote  POST -> {p: frase, s: seed}. Il server ricalcola il testo dal seed:
                      nessuno può far salvare un testo scritto a mano.
   /api/hide  POST -> nasconde una frase (header x-admin-key = variabile ADMIN_KEY)
   Binding richiesto: database D1 con nome variabile DB. */
const A = globalThis.Aziendalese;
const MIN_VOTES = 2;
const BAD = /(cazz|merd|stronz|vaffanc|fancul|puttan|troi[ae]|froci|negr[oi]|coglion|bastard|porc[oa] ?dio|dio ?porc|nazis|terroris|suicid)/i;
let ready = false;

async function init(db) {
  if (ready) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS votes (phrase TEXT NOT NULL, orig TEXT NOT NULL, seed INTEGER NOT NULL, text TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, updated INTEGER NOT NULL, PRIMARY KEY (phrase, seed))'),
    db.prepare('CREATE TABLE IF NOT EXISTS voters (k TEXT PRIMARY KEY, t INTEGER NOT NULL)')
  ]);
  ready = true;
}
const json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
});
async function sha(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const clean = p => String(p || '').replace(/\s+/g, ' ').trim();
const valid = p => /\p{L}/u.test(p) && [...p].length <= 300 && !BAD.test(p);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (!env.DB) return json({ error: 'db_missing' }, 503);
    try {
      await init(env.DB);
      if (url.pathname === '/api/top' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT orig AS p, seed AS s, text AS t, n FROM votes WHERE hidden = 0 AND n >= ? ORDER BY n DESC, updated DESC LIMIT 60').bind(MIN_VOTES).all();
        return json({ items: results, min: MIN_VOTES }, 200, { 'cache-control': 'public, max-age=60' });
      }
      if (url.pathname === '/api/vote' && request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'bad_json' }, 400); }
        const orig = clean(body.p), seed = Number(body.s);
        if (!valid(orig) || !Number.isInteger(seed) || seed < 0 || seed > 4294967295) return json({ error: 'invalid' }, 400);
        const key = A.norm(orig);
        const text = A.translate(orig, 'board', { seed }).text;
        const ip = request.headers.get('CF-Connecting-IP') || 'anon';
        const voter = await sha(ip + '|' + key + '|' + (env.SALT || 'a-tendere'));
        const first = await env.DB.prepare('INSERT OR IGNORE INTO voters (k, t) VALUES (?, ?)').bind(voter, Date.now()).run();
        if (!first.meta.changes) return json({ error: 'already_voted' }, 409);
        await env.DB.prepare('INSERT INTO votes (phrase, orig, seed, text, n, hidden, updated) VALUES (?, ?, ?, ?, 1, 0, ?) ON CONFLICT(phrase, seed) DO UPDATE SET n = n + 1, updated = excluded.updated')
          .bind(key, orig, seed, text, Date.now()).run();
        const row = await env.DB.prepare('SELECT n FROM votes WHERE phrase = ? AND seed = ?').bind(key, seed).first();
        return json({ ok: true, n: row ? row.n : 1, text });
      }
      if (url.pathname === '/api/hide' && request.method === 'POST') {
        if (!env.ADMIN_KEY || request.headers.get('x-admin-key') !== env.ADMIN_KEY) return json({ error: 'forbidden' }, 403);
        const body = await request.json().catch(() => ({}));
        const r = await env.DB.prepare('UPDATE votes SET hidden = 1 WHERE phrase = ?').bind(A.norm(clean(body.p))).run();
        return json({ ok: true, hidden: r.meta.changes });
      }
      return json({ error: 'not_found' }, 404);
    } catch (err) {
      return json({ error: 'server', detail: String(err && err.message || err).slice(0, 200) }, 500);
    }
  }
};
