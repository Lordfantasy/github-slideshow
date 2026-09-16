# Eureka the original — sito

Vetrina di prodotto per il sandalo due occhi. Next.js (App Router),
TypeScript, Tailwind v4, React Three Fiber.

## Avvio

```bash
npm install
npm run dev       # sviluppo
npm run build     # produce ./out, sito statico
```

Il sito è esportato **statico**: nessuna rotta API, nessun dato che cambia a
richiesta. La cartella `out/` si pubblica ovunque — GitHub Pages, Vercel,
Netlify, un qualunque spazio web.

Va **servito**, non aperto col doppio clic: i percorsi delle risorse sono
assoluti e `file://` non li trova. In locale basta:

```bash
npm run build && npx serve out      # oppure: cd out && python3 -m http.server
```

### In sottocartella (GitHub Pages)

```bash
NEXT_PUBLIC_BASE_PATH=/github-slideshow npm run build
```

Lo fa già da solo il workflow `.github/workflows/pages.yml` a ogni push su
questo branch. Perché funzioni, una volta sola: su GitHub, **Settings →
Pages → Source: GitHub Actions**.

## Com'è fatto

| Sezione | Cosa fa |
|---|---|
| Hero | Trittico: testo, prodotto, misure. Il prodotto sono 32 pose renderizzate fuori dal browser: si trascina e gira, senza WebGL. |
| Collezione | Fila orizzontale con scatto, tre modelli. |
| La storia | 1878 → anni '70 → oggi, con contatori. |
| Fatto a mano | I sei gesti, poi la camera 3D che scorre lungo il fianco fino al macro. |
| Configura | Pellame, colore, fondo, misura. Ricolora il modello dal vivo; la scelta sta nell'indirizzo. |
| Contatti | Dove siamo, e i due canali ufficiali. |

## Dove stanno i testi

Tutti in `src/lib/content.ts`. Niente stringhe sparse nei componenti.

## Dati veri e dati non pubblici

Presi dal sito ufficiale: i sette pellami, le misure 17–28 (modello alto
fino al 26), i quindici giorni di lavorazione, la storia.

**Non pubblici, quindi non presenti:** prezzi, telefono, e-mail, showroom,
cartelle colore per pellame. Non sono segnaposto: il sito racconta quel che
sa e per il resto manda al sito ufficiale. Non c'è un modulo contatti,
perché un modulo senza destinatario è una promessa falsa.

I campioni colore del configuratore sono dichiarati in pagina come
anteprima, non come campionario.

## Vincoli rispettati

- Nessuna dipendenza da CDN: three.js, drei e i font sono locali o di sistema.
- Senza WebGL restano la fotografia e tutte le scelte del configuratore.
- `prefers-reduced-motion`: niente camera guidata, niente rotazione
  automatica, sezioni che tornano alte un solo schermo.
- Contrasto ≥ 4,5:1 su ogni testo, bersagli ≥ 24 px, un solo `h1`,
  landmark `main`, link di salto, menu `inert` da chiuso.
- Solo italiano: la versione inglese richiede testi che non sono arrivati.

## Misure (build di produzione, desktop 1440px)

- primo disegno con contenuto: **440 ms**
- JS della prima pagina: **143 KB compressi** (473 grezzi)
- prima pagina completa: **1,8 MB** — le 32 pose del prodotto
- dopo aver visto tutto: **3,5 MB** — si aggiunge il modello 3D da 2 MB,
  che arriva solo a chi scorre fin laggiù

## Il modello 3D

`public/eureka-due-occhi.glb` ha **una mesh** con tre gruppi di materiale,
nessuna UV, nessuna texture: la grana è scolpita nella geometria. Va bene
per ricolorare, non per smontare. Per un esploso dei componenti servono
mesh separate — dettagli in `NOTE-FASE-2.md`.
