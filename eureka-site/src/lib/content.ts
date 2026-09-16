/* =========================================================
   Tutti i testi del sito, in un posto solo.
   Regola del brief: niente dati inventati. Dove manca un contenuto
   ufficiale c'e' un segnaposto visibile, che l'interfaccia mostra come
   tale invece di riempirlo di finzione.
   ========================================================= */
export const daFornire = (cosa: string) => `[DA FORNIRE: ${cosa}]`;

export const brand = {
  nome: "Eureka",
  esteso: "Eureka the original",
  claim: "L'originale sandalo due occhi",
  dal: "1878",
};

export const nav = [
  { label: "Due occhi", href: "#prodotto" },
  { label: "Collezione", href: "#collezione" },
  { label: "La storia", href: "#storia" },
  { label: "Fatto a mano", href: "#lavorazione" },
];

export const hero = {
  titolo: ["Due occhi,", "un secolo."],
  testo:
    "Il sandalo nato da una forma in legno disegnata con un pediatra, perche' " +
    "rispettasse davvero il piede di un bambino. Da allora si taglia, si cuce " +
    "e si monta a mano, una paia alla volta.",
  cta: "Scopri il due occhi",
  payoff: ["Fatto a mano in Italia,", "dal 1878."],
  prezzo: daFornire("prezzo"),
  prezzoPieno: daFornire("prezzo pieno"),
  taglieEtichetta: "Scegli la misura",
  taglie: [] as string[],
  taglieMancanti: daFornire("scalare delle misure"),
};

export const collezione = [
  { id: "due-occhi", nome: "Due Occhi", riga: "L'archetipo",
    testo: "Pelle pieno fiore, fondo cucito, gli occhietti aperti sulla punta.",
    img: "/img/card-due-occhi.webp" },
  { id: "due-occhi-ai", nome: "Due Occhi #AI", riga: "Autunno · Inverno",
    testo: "Suola Vibram tagliata a mano, fodera in lana tartan o vitello beige.",
    img: "/img/card-due-occhi-ai.webp" },
  { id: "configurabili", nome: "Configurabili", riga: "Su misura · 15 giorni",
    testo: "Vitello, trapper, camoscio, montone lavato, laminati, vernici, velluto.",
    img: "/img/card-configurabili.webp" },
];

export const storia = [
  { anno: "1878", luogo: "Milano", titolo: "Nasce l'Antica Calzoleria Eureka",
    testo: "Dalla passione della famiglia Forzinetti. Mario Forzinetti commissiona a un illustre pediatra dell'epoca una forma in legno con tutti i requisiti del piede infantile." },
  { anno: "Anni '70", luogo: "Montegranaro (FM)", titolo: "I fratelli Medori raccolgono il filo",
    testo: "L'azienda passa alla famiglia Medori, nel cuore del distretto calzaturiero marchigiano, che rilancia il sandalo conservando la costruzione Ideal." },
  { anno: "Oggi", luogo: "Lo stabilimento", titolo: "2.000 metri quadri di mani",
    testo: "Circa duecento paia al giorno di costruzione ideale, dieci persone in fabbrica. Nessun robot ha mai imparato a fare questo nodo." },
];

export const numeri = [
  { valore: 1878, suffisso: "", etichetta: "anno di fondazione", statico: true },
  { valore: 2000, suffisso: " m²", etichetta: "lo stabilimento" },
  { valore: 10, suffisso: "", etichetta: "persone in fabbrica" },
  { valore: 200, suffisso: "", etichetta: "paia al giorno" },
];

export const lavorazione = {
  titolo: "La lavorazione Ideal.",
  testo: "Interamente a mano, con i migliori pellami. E' il metodo che non e' mai cambiato: la forma prima della scarpa, il taglio che segue la fibra, gli occhietti rifiniti a occhio, la cucitura col filo cerato, il montaggio sulla forma, la rifinitura.",
  passi: [
    { n: "01", nome: "La forma", testo: "Si parte dal legno, non dal disegno." },
    { n: "02", nome: "Il taglio", testo: "Pelli di prima scelta, tagliate seguendo la fibra." },
    { n: "03", nome: "Gli occhi", testo: "I due fori in punta, rifiniti e allineati a occhio." },
    { n: "04", nome: "La cucitura", testo: "Punto dopo punto, con il filo cerato." },
    { n: "05", nome: "Il montaggio", testo: "Tomaia e fondo si sposano sulla forma." },
    { n: "06", nome: "La rifinitura", testo: "Cera, spazzola, controllo." },
  ],
};

export const contatti = {
  titolo: "Scriveteci.",
  luogo: ["Montegranaro (FM)", "Marche · Italia"],
  telefono: daFornire("telefono"),
  email: daFornire("indirizzo e-mail"),
  showroom: daFornire("indirizzo showroom"),
};

export const social = [
  { nome: "Instagram", href: "https://www.instagram.com/eurekatheoriginal/" },
];
