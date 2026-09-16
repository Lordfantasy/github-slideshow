import type { NextConfig } from "next";

/* Il sito non ha bisogno di un server: nessuna rotta API, nessun dato che
   cambia a richiesta. Esportandolo statico puo' stare ovunque, anche su
   GitHub Pages come il sito precedente. */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
