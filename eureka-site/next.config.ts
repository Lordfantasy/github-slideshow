import type { NextConfig } from "next";

/* Il sito non ha bisogno di un server: nessuna rotta API, nessun dato che
   cambia a richiesta. Esportandolo statico puo' stare ovunque.
   NEXT_PUBLIC_BASE_PATH serve quando vive in una sottocartella, come su
   GitHub Pages; in sviluppo non c'e' e il sito sta alla radice. */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: base || undefined,
  /* "./" rende i percorsi relativi: serve per aprire il sito da file:// */
  assetPrefix: base || (process.env.NEXT_PUBLIC_RELATIVO === "1" ? "./" : undefined),
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
