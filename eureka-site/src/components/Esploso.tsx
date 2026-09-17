"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { leggiWebGL, suServer, sottoscrivi } from "@/lib/webgl";
import { leggiMovimentoRidotto, movimentoSulServer, sottoscriviMovimento } from "@/lib/movimento";
import RipiegoScena from "./RipiegoScena";
import Scudo from "./Scudo";

/* Cosa si vede avvicinandosi, nell'ordine in cui la camera ci arriva. */
const TAPPE = [
  { nome: "Il guardolo", testo: "Il bordo cucito che tiene insieme tomaia e fondo." },
  { nome: "La cucitura", testo: "Punto dopo punto, con il filo cerato." },
  { nome: "Gli occhietti", testo: "I due fori in punta: il piede respira." },
] as const;

/* La libreria del visore arriva solo quando la sezione si avvicina */
const Visore = dynamic(() => import("./Visore"), { ssr: false });

export default function Esploso() {
  const sezione = useRef<HTMLDivElement>(null);
  const avanzamento = useRef(0);
  /* Il visore si aggiorna a passi: quaranta scatti lungo la sezione.
     Ridisegnare a ogni pixel sarebbe sprecato, e model-viewer interpola
     da solo fra un'inquadratura e l'altra, quindi il movimento resta
     continuo. */
  const [vicino, setVicino] = useState(0);
  const [monta, setMonta] = useState(false);
  const webgl = useSyncExternalStore(sottoscrivi, leggiWebGL, suServer);
  const fermo = useSyncExternalStore(sottoscriviMovimento, leggiMovimentoRidotto, movimentoSulServer);

  useEffect(() => {
    const el = sezione.current;
    if (!el) return;
    /* il modello pesa: si carica solo quando la sezione si avvicina */
    const io = new IntersectionObserver(
      (voci) => voci.some((v) => v.isIntersecting) && (setMonta(true), io.disconnect()),
      { rootMargin: "60% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (fermo) {
      avanzamento.current = 1;
      sezione.current?.style.setProperty("--p", "1");
      return;
    }
    const el = sezione.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const corsa = r.height - window.innerHeight;
      const p = corsa > 0 ? Math.min(Math.max(-r.top / corsa, 0), 1) : 0;
      avanzamento.current = p;
      el.style.setProperty("--p", String(p));
      setVicino((v) => {
        const passo = Math.round(p * 40) / 40;
        return passo === v ? v : passo;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [fermo]);

  return (
    <div ref={sezione} className="macro relative h-[260svh]" id="esploso">
      <div className="macro-fermo sticky top-0 grid h-svh place-items-center overflow-hidden">
        <div className="relative h-[70svh] w-full max-w-[1100px]">
          {monta && webgl ? (
            <Scudo ripiego={<RipiegoScena />}>
              <Visore
                alt="Il sandalo due occhi visto da vicino: guardolo, cucitura e occhietti"
                tinte={{ pelle: "#A8622F", fondo: "#C9A57C", fodera: "#EFE0C8" }}

                avvicinamento={fermo ? 1 : vicino}
                autoRuota={false}
                className="visore"
              />
            </Scudo>
          ) : (
            <RipiegoScena />
          )}
        </div>
        <ul className="macro-note pointer-events-none absolute inset-x-0 bottom-16 mx-auto grid w-[min(1100px,100%-2.5rem)] grid-cols-3 gap-4 text-center">
          {TAPPE.map((tappa, i) => (
            <li key={tappa.nome}
                style={{
                  /* ogni strato si annuncia quando tocca a lui */
                  opacity: `calc((var(--p, 0) - ${[0.0, 0.3, 0.66][i]}) * 4)`,
                  transform: "translateY(calc((1 - var(--p, 0)) * 8px))",
                }}>
              <span className="block text-[.72rem] font-semibold md:text-[.85rem]">{tappa.nome}</span>
              <span className="mt-1 block text-[.64rem] leading-snug md:text-[.72rem]"
                    style={{ color: "var(--campo-300)" }}>{tappa.testo}</span>
            </li>
          ))}
        </ul>
        <p className="pointer-events-none absolute bottom-6 text-[.62rem] uppercase tracking-[.22em]"
           style={{ color: "var(--campo-300)" }}>
          Scorri: la camera si avvicina
        </p>
      </div>
    </div>
  );
}
