# Fase 2 — il 3D dal vero, e cosa il modello non permette

## Il fatto tecnico
`eureka-due-occhi.glb` contiene **una sola mesh** con **tre gruppi di
materiale** (`pelle`, `fondo`, `fodera_e_filo`). Verificato leggendo il file:

- i tre gruppi condividono **lo stesso elenco di punti** (accessor 0) e si
  distinguono solo per quali triangoli disegnano;
- i vertici reali sono **63.947**, non 191.841: quel numero era lo stesso
  elenco contato tre volte;
- per questo ogni gruppo dichiara come proprio ingombro l'intera scarpa.
  I confini veri, ricavati dai triangoli di ciascuno:

  | gruppo | triangoli | punti usati | altezza occupata |
  |---|---|---|---|
  | pelle | 73.648 | 38.109 | da 0,059 a 0,484 |
  | fondo | 31.443 | 18.697 | da 0,000 a 0,476 |
  | fodera_e_filo | 24.265 | 13.483 | da 0,071 a 0,472 |

Non sono pezzi impilati: sono **gusci annidati e compenetrati**.

## Le due strade provate per l'esploso, entrambe fallite
1. **Allontanare i gruppi.** Meccanicamente funziona — il caricatore li rende
   tre oggetti spostabili. Ma restano lembi bucati: sono porzioni di una
   superficie continua, non volumi chiusi. Sembra una scarpa strappata.
2. **Renderli trasparenti a turno.** Niente si buca, ma non si svela niente:
   gli strati sono compenetrati e di colore simile, si vede solo la scarpa
   che gira.

Causa unica: **il file ha gruppi di materiale, non parti.**
I gruppi di materiale servono benissimo a **ricolorare** (ed e' per questo che
il configuratore funzionera'), ma non a **smontare**.

## Cosa c'e' al loro posto
La camera scorre lungo il fianco mentre si scorre la pagina, dal tre quarti
al macro: guardolo, cucitura e occhietti arrivano uno alla volta. Il modello
non viene forzato a fare quel che non puo'.

## Per avere l'esploso servirebbe
Mesh separate e nominate: `suola`, `fondo`, `tomaia`, `cinturino`
(specifica completa nel messaggio di consegna della Fase 1).

## Altro
- Ambiente luminoso costruito con `Lightformer` di drei: niente preset, che
  si scaricherebbero da un CDN.
- Il modello si monta solo quando la sezione si avvicina (60% di anticipo).
- `prefers-reduced-motion`: stato finale fermo, niente camera guidata.
