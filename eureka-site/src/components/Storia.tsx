"use client";
import { useEffect, useRef, useState } from "react";
import Entra from "./Entra";
import { storia, numeri } from "@/lib/content";

function Contatore({ a, suffisso, statico }: { a: number; suffisso: string; statico?: boolean }) {
  const [v, setV] = useState(() => (statico ? a : 0));
  const rif = useRef<HTMLElement>(null);

  useEffect(() => {
    if (statico) return;
    const el = rif.current;
    if (!el) return;
    /* il valore si aggiorna quando il numero entra in vista: e' una
       sottoscrizione a qualcosa di esterno, non un secondo disegno subito */
    const io = new IntersectionObserver((voci) => {
      if (!voci.some((x) => x.isIntersecting)) return;
      io.unobserve(el);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(a); return; }
      const t0 = performance.now();
      const passo = (t: number) => {
        const u = Math.min((t - t0) / 1400, 1);
        setV(Math.round(a * (1 - Math.pow(1 - u, 3))));
        if (u < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [a, statico]);

  return <b ref={rif} className="block text-4xl font-semibold md:text-5xl">{v}{suffisso}</b>;
}

export default function Storia() {
  return (
    <section id="storia" className="py-20 md:py-28" style={{ background: "var(--campo-800)" }}>
      <div className="mx-auto w-[min(1320px,100%-2.5rem)]">
        <Entra className="mb-12 max-w-[26ch]">
          <p className="occhiello">La nostra storia</p>
          <h2 className="h2">Centoquarantasette anni,<br />un filo solo.</h2>
        </Entra>

        <ol className="grid gap-6 md:grid-cols-3">
          {storia.map((t, i) => (
            <li key={t.anno}>
              <Entra delay={i * 110}>
                <article className="h-full rounded-2xl p-6" style={{ background: "var(--campo-700)" }}>
                  <p className="text-[.66rem] uppercase tracking-[.2em]" style={{ color: "var(--ottone-testo)" }}>{t.luogo}</p>
                  <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--cuoio-chiaro)" }}>{t.anno}</p>
                  <h3 className="mt-3 text-lg font-semibold">{t.titolo}</h3>
                  <p className="corpo mt-2 text-[.9rem]">{t.testo}</p>
                </article>
              </Entra>
            </li>
          ))}
        </ol>

        <Entra className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-4">
          {numeri.map((n) => (
            <div key={n.etichetta}>
              <Contatore a={n.valore} suffisso={n.suffisso} statico={n.statico} />
              <span className="mt-2 block text-[.64rem] uppercase tracking-[.18em]" style={{ color: "var(--campo-300)" }}>
                {n.etichetta}
              </span>
            </div>
          ))}
        </Entra>
      </div>
    </section>
  );
}
