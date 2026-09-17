/* =========================================================
   Tutti i testi del sito, in un posto solo.
   Regola del brief: niente dati inventati. Quel che non e' pubblico non
   viene ne' inventato ne' lasciato come buco in pagina: il sito racconta
   quel che sa e manda al sito ufficiale per il resto.
   ========================================================= */

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
  { label: "Configura", href: "#configura" },
];

export const hero = {
  titolo: ["Due occhi,", "un secolo."],
  testo:
    "Il sandalo nato da una forma in legno disegnata con un pediatra, perche' " +
    "rispettasse davvero il piede di un bambino. Da allora si taglia, si cuce " +
    "e si monta a mano, una paia alla volta.",
  cta: "Scopri il due occhi",
  ctaConfigura: "Configura il tuo",
  payoff: ["Fatto a mano in Italia,", "dal 1878."],
  taglieEtichetta: "Le misure",
  taglieNota: "Dalla 17 alla 28. Il modello alto arriva al 26.",
  taglie: Array.from({ length: 12 }, (_, i) => String(17 + i)),
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

/* =========================================================
   Configuratore.
   Pellami e misure sono quelli veri del sito ufficiale.
   Le cartelle colore per ciascun pellame NON sono pubbliche: i campioni
   qui sotto sono un'anteprima dichiarata, non il campionario Eureka.
   ========================================================= */
export const configuratore = {
  pellami: [
    "Vitello", "Trapper", "Camoscio", "Montone lavato",
    "Laminato", "Vernice", "Velluto",
  ],
  coloriProvvisori: [
    { nome: "Cuoio", hex: "#A8622F" },
    { nome: "Testa di moro", hex: "#4A2E1C" },
    { nome: "Rosso", hex: "#C2402A" },
    { nome: "Verde", hex: "#6E7A5E" },
    { nome: "Ocra", hex: "#D9A441" },
    { nome: "Avorio", hex: "#EFE3D2" },
    { nome: "Blu", hex: "#3B4A6B" },
    { nome: "Nero", hex: "#241C15" },
  ],
  notaColori: "Anteprima dei toni: non e' il campionario completo.",
  fondi: [
    { nome: "Cuoio naturale", hex: "#C9A57C" },
    { nome: "Vibram tagliata a mano", hex: "#2B2621" },
  ],
  /* dal sito: sandali per bambino dalla 17 alla 28 */
  misure: Array.from({ length: 12 }, (_, i) => String(17 + i)),
  notaMisure: "Il modello alto arriva fino al 26; dal 27 in su resta il modello basso.",
  attesa: "Tagliato dopo l'ordine \u00b7 pronto in 15 giorni",
  cta: "Porta questa configurazione a Eureka",
};

export const contatti = {
  titolo: "Ci trovate qui.",
  testo:
    "Lo stabilimento e' a Montegranaro, nelle Marche, nel distretto " +
    "calzaturiero dove il due occhi si fa da cinquant'anni.",
  luogo: ["Montegranaro (FM)", "Marche \u00b7 Italia"],
  recapiti: { etichetta: "Recapiti e rivenditori", href: "https://eurekatheoriginal.it/" },
};

export const social = [
  { nome: "Instagram", href: "https://www.instagram.com/eurekatheoriginal/" },
];
