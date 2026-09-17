import type { Metadata } from "next";
import "./globals.css";

const SITO = "https://eurekatheoriginal.it";

export const metadata: Metadata = {
  metadataBase: new URL(SITO),
  title: {
    default: "Eureka the original — L'originale sandalo due occhi dal 1878",
    template: "%s · Eureka the original",
  },
  description:
    "Il sandalo due occhi, interamente a mano con lavorazione Ideal nel distretto calzaturiero di Montegranaro. Dal 1878. Configurabile: pellame, colore, fondo e misura.",
  keywords: [
    "sandalo due occhi", "Eureka the original", "scarpe bambino fatte a mano",
    "lavorazione Ideal", "Montegranaro", "calzature artigianali italiane",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Eureka the original",
    title: "Due occhi, un secolo.",
    description: "L'originale sandalo due occhi, cucito a mano dal 1878.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Il sandalo due occhi Eureka" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Due occhi, un secolo.",
    description: "L'originale sandalo due occhi, cucito a mano dal 1878.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

/* Dati strutturati: solo fatti verificabili. Niente prodotto con prezzo,
   perche' il prezzo non ce l'ho e un Product incompleto vale meno di zero. */
const datiStrutturati = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Eureka the original",
  url: SITO,
  foundingDate: "1878",
  description:
    "Calzature per bambino interamente realizzate a mano con lavorazione Ideal. L'originale sandalo due occhi.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Montegranaro",
    addressRegion: "FM",
    addressCountry: "IT",
  },
  sameAs: ["https://www.instagram.com/eurekatheoriginal/"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full">
        <a className="salta" href="#contenuto">Vai al contenuto</a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datiStrutturati) }}
        />
      </body>
    </html>
  );
}
