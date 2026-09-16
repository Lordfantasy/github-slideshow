import Entra from "./Entra";
import { lavorazione } from "@/lib/content";

export default function Lavorazione() {
  return (
    <section id="lavorazione" className="py-20 md:py-28" style={{ background: "var(--campo-600)" }}>
      <div className="mx-auto w-[min(1320px,100%-2.5rem)]">
        <Entra className="mb-12 max-w-[52ch]">
          <p className="occhiello">Fatto a mano</p>
          <h2 className="h2">{lavorazione.titolo}</h2>
          <p className="corpo mt-5">{lavorazione.testo}</p>
        </Entra>
        <ol className="grid gap-px overflow-hidden rounded-2xl md:grid-cols-3"
            style={{ background: "rgba(241,234,230,.14)" }}>
          {lavorazione.passi.map((p, i) => (
            <li key={p.n} style={{ background: "var(--campo-700)" }}>
              <Entra delay={i * 70} className="h-full">
                <div className="h-full p-6">
                  <span className="text-[.66rem] tracking-[.2em]" style={{ color: "var(--ottone)" }}>{p.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{p.nome}</h3>
                  <p className="corpo mt-2 text-[.88rem]">{p.testo}</p>
                </div>
              </Entra>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
