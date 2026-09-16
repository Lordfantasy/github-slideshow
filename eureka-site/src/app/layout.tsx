import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eureka the original — L'originale sandalo due occhi dal 1878",
  description:
    "Il sandalo due occhi, cucito a mano con lavorazione Ideal nel distretto calzaturiero di Montegranaro. Dal 1878.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full">
        <a className="salta" href="#contenuto">Vai al contenuto</a>
        {children}
      </body>
    </html>
  );
}
