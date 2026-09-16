"use client";
import { useEffect, useState } from "react";
import { brand, nav } from "@/lib/content";

/* Impianto del riferimento: marchio a sinistra, navigazione a pillola al
   centro, comandi a destra. Niente carrello: il negozio non esiste ancora
   e un'icona che non porta da nessuna parte e' una promessa falsa. */
export default function Header() {
  const [attiva, setAttiva] = useState(nav[0].href);
  const [compatta, setCompatta] = useState(false);
  const [aperto, setAperto] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompatta(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (voci) => voci.forEach((v) => v.isIntersecting && setAttiva("#" + v.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    nav.forEach((v) => {
      const el = document.querySelector(v.href);
      if (el) io.observe(el);
    });
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 md:px-8 transition-colors duration-500"
      style={{
        height: "var(--nav-h)",
        background: compatta ? "rgba(46,37,40,.86)" : "transparent",
        backdropFilter: compatta ? "blur(12px)" : "none",
      }}
    >
      <a href="#contenuto" className="flex items-center gap-2.5" aria-label={`${brand.esteso}, torna in cima`}>
        <span className="grid h-8 w-8 place-items-center rounded-md" style={{ background: "var(--campo-100)" }}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <circle cx="8.5" cy="12" r="3.4" fill="none" stroke="var(--campo-900)" strokeWidth="2" />
            <circle cx="15.5" cy="12" r="3.4" fill="none" stroke="var(--campo-900)" strokeWidth="2" />
          </svg>
        </span>
        <span className="text-[.78rem] tracking-[.22em] uppercase">{brand.nome}</span>
      </a>

      <nav className="hidden md:flex items-center gap-1 rounded-full px-1.5 py-1.5"
           style={{ background: "rgba(241,234,230,.1)" }}>
        {nav.map((v) => {
          const on = attiva === v.href;
          return (
            <a key={v.href} href={v.href}
               className="rounded-full px-4 py-2 text-[.74rem] uppercase tracking-[.1em] transition-colors"
               style={on ? { background: "var(--campo-100)", color: "var(--campo-900)" } : undefined}
               aria-current={on ? "page" : undefined}>
              {v.label}
            </a>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <a href="#contatti" className="pillola-vuota hidden sm:inline-flex">Contatti</a>
        <button className="tondo md:hidden" aria-label={aperto ? "Chiudi il menu" : "Apri il menu"}
                aria-expanded={aperto} onClick={() => setAperto(!aperto)}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d={aperto ? "M6 6l12 12M18 6L6 18" : "M4 9h16M4 15h16"}
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>

      <div id="menu-mobile" inert={!aperto || undefined}
           className="fixed inset-0 z-40 grid place-content-center gap-4 text-center md:hidden transition-[clip-path] duration-700"
           style={{
             background: "var(--campo-900)",
             clipPath: aperto ? "circle(150% at calc(100% - 40px) 34px)" : "circle(0% at calc(100% - 40px) 34px)",
             visibility: aperto ? "visible" : "hidden",
           }}
           aria-hidden={!aperto}>
        {nav.map((v) => (
          <a key={v.href} href={v.href} className="text-2xl" onClick={() => setAperto(false)}>{v.label}</a>
        ))}
        <a href="#contatti" className="text-2xl" onClick={() => setAperto(false)}>Contatti</a>
      </div>
    </header>
  );
}
