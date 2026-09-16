import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Collezione from "@/components/Collezione";
import Storia from "@/components/Storia";
import Lavorazione from "@/components/Lavorazione";
import Configuratore from "@/components/Configuratore";
import Contatti from "@/components/Contatti";

export default function Home() {
  return (
    <>
      <Header />
      <main id="contenuto" tabIndex={-1}>
        <Hero />
        <Collezione />
        <Storia />
        <Lavorazione />
        <Suspense fallback={null}><Configuratore /></Suspense>
      </main>
      <Contatti />
    </>
  );
}
