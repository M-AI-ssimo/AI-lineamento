# AI-Lineamento · Traduttore satirico in aziendalese

## Cosa c'è nella cartella
| File | A cosa serve |
|---|---|
| index.html, style.css, app.js | Pagina, grafica, animazione, condivisione |
| engine.js | Motore: italiano → aziendalese (keynote) e aziendalese → italiano |
| vocab.js | Glossario da 150 voci (dal file Excel) |
| tips.js | Consigli del giorno, con fonte |
| _worker.js | Backend per i voti: motore + API (generato da tools/build.sh) |
| tools/ | Sorgente del backend e script di build |
| favicon.svg, og-image.png | Icona e anteprima per LinkedIn/Facebook |

## Pubblicazione gratuita (GitHub + Cloudflare Pages + D1)
Il caricamento drag and drop di Cloudflare non attiva il backend: serve il collegamento a GitHub.

1. **GitHub.** Crea un account su github.com, poi un nuovo repository (es. `ai-lineamento`). Clicca "uploading an existing file", trascina TUTTI i file e la cartella tools, poi "Commit changes".
2. **Cloudflare Pages.** Su dash.cloudflare.com: Workers & Pages → Create → Pages → Connect to Git. Scegli il repository. Framework: None. Build command: vuoto. Output directory: `/`. Salva e pubblica. Il sito sarà su `nome-progetto.pages.dev`.
3. **Database dei voti (D1).** Nel menu Storage & Databases → D1 → crea un database, es. `ai-lineamento-voti`. Le tabelle si creano da sole al primo voto.
4. **Collegamento.** Nel progetto Pages: Settings → Bindings → Add → D1 database. Nome variabile: `DB` (esattamente così). Database: `ai-lineamento-voti`. Poi rifai il deploy (Deployments → Retry deployment).
5. **Moderazione (consigliato).** In Settings → Variables and Secrets aggiungi il segreto `ADMIN_KEY` con una password tua. Per nascondere una frase:
   `curl -X POST https://TUO-SITO/api/hide -H "x-admin-key: PASSWORD" -H "content-type: application/json" -d '{"p":"frase da nascondere"}'`
6. **Indirizzo.** Se il sito non si chiama `ai-lineamento.pages.dev`, sostituisci l'indirizzo in index.html (canonical, og:url, og:image) e in app.js (SITE_URL). Ogni modifica su GitHub ripubblica il sito da sola.

Senza il database il sito funziona lo stesso: la sezione voti resta nascosta.

## Modificare il motore
- Frasi intere: RULES in engine.js (usa le varianti "key").
- Verbi: VERBS ed EXTRA_KEY. Nomi: NOUNS. Espressioni: EXPR. Cornici: OPEN_KEY, CLOSE_KEY.
- Dopo ogni modifica a engine.js rigenera il backend: `sh tools/build.sh` (oppure chiedimelo).

## Limiti del piano gratuito D1
5 milioni di righe lette e 100.000 scritte al giorno. Ogni voto ne scrive circa 3.
