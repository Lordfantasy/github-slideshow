# Fase 5 — rifinitura

## Misurato sulla build di produzione (Chromium, 1440px)

| | prima della fase | dopo |
|---|---|---|
| JS della prima pagina | 419 KB | **143 KB** |
| primo disegno con contenuto | 628 ms | **440 ms** |
| totale prima pagina | 2.070 KB | **1.794 KB** |
| totale dopo aver visto tutto | 3.507 KB | 3.512 KB |

three.js, R3F e drei stavano nel primo carico anche se l'hero non li usa:
ora le due scene 3D sono in file separati, caricati solo quando la loro
sezione si avvicina.

## Senza WebGL
Nessun canvas creato, al suo posto la fotografia gia' renderizzata, e le
**29 scelte del configuratore restano tutte usabili**. Nessun errore.

## Movimento ridotto
La sezione macro passa da 2.340 a **840 px**: senza camera guidata non ha
motivo di essere alta tre schermi. Stato finale fermo, didascalie tutte
leggibili insieme. Niente rotazione automatica nel configuratore.

## Accessibilita', misurata sul rendering
- Contrasti sotto soglia: **nessuno**. Due correzioni:
  - `--ottone` #B08D57 dava 2,53:1 sul campo. Diviso in due token: resta
    per filetti e bordi (elemento grafico), per il testo si usa
    `--ottone-testo` #E0C79A, 4,76:1 sul campo e 5,85:1 sulle card.
  - Il "contrasto 1.00" che avevo misurato sul menu era un artefatto del
    mio controllo, che non componeva gli strati semitrasparenti: il valore
    vero e' 5,15:1. Corretto il controllo, non il sito.
- Bersagli sotto i 24 px: **nessuno**. Il link Instagram nell'hero era alto
  13 px, portato a 44.
- Ordine dei titoli senza salti, un solo h1, landmark `main`, `lang="it"`.

## SEO
Titolo con template, descrizione, canonical, Open Graph e Twitter card con
immagine 1200x630 generata dal modello, favicon, dati strutturati
Organization. Niente `Product`: senza prezzo sarebbe un dato incompleto.

## Cinque correzioni chieste dal compilatore React, accolte alla radice
- Cursore letto da un ref durante il disegno: non si sarebbe mai aggiornato.
- Stato usato come scorciatoia per leggere quali pose erano caricate.
- `setState` sincrono dentro effetti (contatori, parametri dell'indirizzo).
- Materiali three.js mutati a mano: ora dichiarati in JSX.
- Rotazione passata fra componenti con un ref condiviso.

## Segnaposto ancora aperti
prezzo · telefono · e-mail · showroom · destinatario del modulo ·
cartelle colore per pellame · versione inglese (serve la v1.1)
