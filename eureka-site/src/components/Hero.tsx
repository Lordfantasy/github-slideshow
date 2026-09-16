"use client";
import SpinViewer from "./SpinViewer";
import { hero, social } from "@/lib/content";

/* Trittico del riferimento: testo a sinistra, prodotto al centro, misure
   a destra. Al posto del prezzo c'e' l'invito a configurare: il negozio
   non e' qui, e un prezzo inventato sarebbe peggio di nessun prezzo. */
export default function Hero() {
  return (
    <section id="prodotto" className="relative min-h-svh overflow-hidden pt-[var(--nav-h)]">
      <div className="alone" aria-hidden="true" />
      <div className="relative mx-auto grid w-[min(1320px,100%-2.5rem)] grid-cols-1 items-center gap-8 py-10 lg:grid-cols-12 lg:gap-6 lg:py-16">

        {/* testo */}
        <div className="order-2 lg:order-1 lg:col-span-4">
          <div className="mb-6 flex gap-2" aria-hidden="true">
            <span className="tondo"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
            <span className="tondo"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path d="M10 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
          </div>
          <h1 className="h1">
            {hero.titolo.map((r) => <span key={r} className="block">{r}</span>)}
          </h1>
          <p className="corpo mt-6 text-[.95rem]">{hero.testo}</p>
          <a href="#collezione" className="pillola mt-8">
            {hero.cta}
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <ul className="mt-10 flex gap-4">
            {social.map((s) => (
              <li key={s.nome}>
                <a href={s.href} target="_blank" rel="noopener"
                   className="inline-flex min-h-[44px] items-center text-[.7rem] uppercase tracking-[.16em]"
                   style={{ color: "var(--campo-300)" }}>
                  {s.nome}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* prodotto */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          <SpinViewer className="mx-auto w-full max-w-[620px]" />
          <p className="mt-4 text-center text-[.62rem] uppercase tracking-[.22em]" style={{ color: "var(--campo-300)" }}>
            Trascina per girarlo
          </p>
        </div>

        {/* misure e invito: niente prezzi, il negozio non e' qui */}
        <div className="order-3 lg:col-span-3 lg:justify-self-end lg:text-right">
          <p className="text-[.72rem] uppercase tracking-[.16em]" style={{ color: "var(--campo-300)" }}>
            {hero.taglieEtichetta}
          </p>
          <div className="mt-3 flex max-w-[15rem] flex-wrap gap-1.5 lg:justify-end">
            {hero.taglie.map((t) => (
              <a key={t} href="#configura"
                 className="grid h-10 w-10 place-items-center rounded-full text-[.78rem] transition-colors hover:bg-white/10"
                 style={{ border: "1px solid rgba(241,234,230,.45)" }}>{t}</a>
            ))}
          </div>
          <p className="corpo mt-4 text-[.78rem] lg:ml-auto">{hero.taglieNota}</p>
          <a href="#configura" className="pillola mt-6">
            {hero.ctaConfigura}
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-[.9rem] leading-tight"
         style={{ color: "var(--campo-300)" }}>
        {hero.payoff.map((r) => <span key={r} className="block">{r}</span>)}
      </p>
    </section>
  );
}
