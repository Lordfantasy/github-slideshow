/* Dove stanno le risorse scritte a mano (immagini, pose, modello).
   Next antepone il basePath da solo solo a next/link e next/image.
   - su GitHub Pages il sito vive in /github-slideshow/  -> NEXT_PUBLIC_BASE_PATH
   - per aprirlo da file:// servono percorsi relativi     -> NEXT_PUBLIC_RELATIVO
   - in sviluppo nessuna delle due: tutto alla radice. */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const relativo = process.env.NEXT_PUBLIC_RELATIVO === "1";

export const percorso = (p: string) => (base ? `${base}${p}` : relativo ? `.${p}` : p);
