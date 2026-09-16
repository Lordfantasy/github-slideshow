"use client";
import { useRef } from "react";
import Entra from "./Entra";
import { collezione } from "@/lib/content";

/* Il riferimento scorre fra prodotti in orizzontale: qui una fila
   trascinabile con scatto, non una griglia statica. */
export default function Collezione() {
  const pista = useRef<HTMLUListElement>(null);
  const scorri = (v: number) => pista.current?.scrollBy({ left: v, behavior: "smooth" });

  return (
    <section id="collezione" className="py-20 md:py-28" style={{ background: "var(--campo-700)" }}>
      <div className="mx-auto w-[min(1320px,100%-2.5rem)]">
        <Entra className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="occhiello">Collezione</p>
            <h2 className="h2">Lo stesso sandalo,<br />quattro vite.</h2>
          </div>
          <div className="flex gap-2">
            <button className="tondo" aria-label="Indietro" onClick={() => scorri(-380)}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <button className="tondo" aria-label="Avanti" onClick={() => scorri(380)}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true"><path d="M10 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
        </Entra>

        <ul ref={pista}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {collezione.map((c, i) => (
            <li key={c.id} className="w-[min(360px,82vw)] shrink-0 snap-start">
              <Entra delay={i * 90}>
                <article className="rounded-2xl p-5 transition-transform duration-500 hover:-translate-y-1.5"
                         style={{ background: "var(--campo-600)" }}>
                  <div className="mb-5 grid aspect-[5/4] place-items-center rounded-xl overflow-hidden"
                       style={{ background: "var(--campo-500)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} width={600} height={480} loading="lazy" decoding="async"
                         alt={`${c.nome} — ${c.testo}`} className="h-full w-full object-contain" />
                  </div>
                  <h3 className="text-xl font-semibold">{c.nome}</h3>
                  <p className="corpo mt-2 text-[.9rem]">{c.testo}</p>
                  <p className="mt-4 text-[.68rem] uppercase tracking-[.18em]" style={{ color: "var(--ottone-testo)" }}>{c.riga}</p>
                </article>
              </Entra>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
