/* Su GitHub Pages il sito vive in una sottocartella
   (/github-slideshow/), non alla radice. Next antepone il basePath da solo
   solo a next/link e next/image: per le immagini e il modello, che sono
   percorsi scritti a mano, dobbiamo farlo noi. In sviluppo la variabile
   non c'e' e tutto resta alla radice. */
export const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const percorso = (p: string) => `${base}${p}`;
