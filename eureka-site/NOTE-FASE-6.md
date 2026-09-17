# Fase 6 — il 3D passa a model-viewer

## Cosa e' cambiato

Le due scene 3D non usano piu' React Three Fiber: usano
`<model-viewer>`, il componente di Google, attraverso un unico
componente `src/components/Visore.tsx`.

Fuori sono andate cinque dipendenze: `three`,
`@react-three/fiber`, `@react-three/drei`,
`@react-three/postprocessing`, `gsap`.

## La libreria viene da npm, non dal CDN

La documentazione di model-viewer dice di caricarla da jsDelivr. Qui
no: il sito deve funzionare anche aperto da un file, senza
collegamento. Sta quindi in `node_modules` e finisce nel pacchetto,
caricata con un `import()` dinamico solo quando il visore entra in
pagina.

Verificato: aprendo il sito da `file://` le richieste verso l'esterno
sono zero.

## I colori

Il modello non ha texture: la grana e' scolpita nella geometria e
dipinta nei vertici (`COLOR_0`, luminanza media 0,235). Il colore
scelto nel configuratore si moltiplica su quella grana, quindi da solo
uscirebbe quattro volte piu' scuro del dovuto. `setBaseColorFactor`
accetta valori sopra 1, cosi' si compensa con un fattore (`grana`)
mantenendo il rilievo: 2,4 nel configuratore, 1 nella macro, dove la
tinta piena da' gia' il cuoio giusto.

I valori vanno passati in spazio lineare, non sRGB: la conversione e'
in `versoFattore`.

## I riflessi

Il `.glb` arriva dalla scansione con la pelle a 0,32 di ruvidezza: e'
il lucido di una vernice. A quel valore ogni sfaccettatura della grana
prendeva un riflesso bianco e da vicino la tomaia sembrava stagnola.

`Visore` accetta ora una `ruvidezza`: 0,6 di norma, 0,78 nella
sequenza macro, dove la camera arriva a un palmo dalla tomaia e le
sfaccettature occupano piu' pixel.

## La sequenza macro

Lo scorrimento non muove piu' una camera three.js: scrive
`camera-orbit` sull'elemento, da `210deg 78deg 100%` a
`252deg 72deg 55%`. Con "riduci animazioni" attivo la sezione non e'
piu' alta 260svh e non si appiccica: resta una figura ferma.

## Quando arrivera' un modello rifatto

Le cose che oggi non si possono fare, e perche':

- **vista esplosa**: i tre gruppi di materiale non sono volumi chiusi,
  quindi separandoli si aprono buchi. Servirebbero le parti come mesh
  distinte e chiuse (tomaia, fodera, sottopiede, guardolo, fondo).
- **grana fine**: oggi e' geometria, e da vicino si vedono i
  triangoli. Con `TEXCOORD_0` e una normal map la stessa grana
  starebbe in una texture e reggerebbe qualsiasi ingrandimento.
- **varianti colore**: con `KHR_materials_variants` nel file, i colori
  li definirebbe chi fa il modello invece del codice.
