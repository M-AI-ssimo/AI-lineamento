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
