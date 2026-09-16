import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Collezione from "@/components/Collezione";
import Storia from "@/components/Storia";
import Lavorazione from "@/components/Lavorazione";
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
      </main>
      <Contatti />
    </>
  );
}
