"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { leggiWebGL, suServer, sottoscrivi } from "@/lib/webgl";
import RipiegoScena from "./RipiegoScena";
import Scudo from "./Scudo";
import Entra from "./Entra";
import type { Stato } from "./tipi";

/* La libreria del visore arriva solo quando la sezione si avvicina:
   la prima pagina non la paga */
const Visore = dynamic(() => import("./Visore"), { ssr: false });
import { configuratore as cfg } from "@/lib/content";

function Gruppo({ titolo, children, nota }: { titolo: string; children: React.ReactNode; nota?: string }) {
  return (
    <fieldset className="mb-7 border-0 p-0">
      <legend className="mb-3 p-0 text-[.66rem] uppercase tracking-[.22em]" style={{ color: "var(--campo-300)" }}>
        {titolo}
      </legend>
      {children}
      {nota && <p className="mt-2 text-[.68rem]" style={{ color: "var(--campo-300)" }}>{nota}</p>}
    </fieldset>
  );
}

export default function Configuratore() {
  /* la configurazione arriva dall'indirizzo, cosi' si puo' mandare a
     qualcuno; letta con l'hook di Next, non in un effetto */
  const q = useSearchParams();
  const [stato, setStato] = useState<Stato>(() => ({
    pellame: cfg.pellami.includes(q.get("pellame") ?? "") ? q.get("pellame")! : cfg.pellami[0],
    colore: cfg.coloriProvvisori.some((c) => c.nome === q.get("colore")) ? q.get("colore")! : cfg.coloriProvvisori[0].nome,
    fondo: cfg.fondi.some((f) => f.nome === q.get("fondo")) ? q.get("fondo")! : cfg.fondi[0].nome,
    misura: cfg.misure.includes(q.get("misura") ?? "") ? q.get("misura")! : "22",
  }));
  const [monta, setMonta] = useState(false);
  const webgl = useSyncExternalStore(sottoscrivi, leggiWebGL, suServer);
  const sezione = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sezione.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (v) => v.some((x) => x.isIntersecting) && (setMonta(true), io.disconnect()),
      { rootMargin: "60% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(stato as unknown as Record<string, string>);
    window.history.replaceState(null, "", `?${q}#configura`);
  }, [stato]);

  const scegli = (k: keyof Stato) => (v: string) => setStato((s) => ({ ...s, [k]: v }));

  /* i tre materiali del modello seguono le scelte */
  const tinte = {
    pelle: cfg.coloriProvvisori.find((c) => c.nome === stato.colore)?.hex ?? "#A8622F",
    fondo: cfg.fondi.find((f) => f.nome === stato.fondo)?.hex ?? "#C9A57C",
    fodera: "#EFE0C8",
  };

  return (
    <section ref={sezione} id="configura" className="py-20 md:py-28" style={{ background: "var(--campo-700)" }}>
      <div className="mx-auto w-[min(1320px,100%-2.5rem)]">
        <Entra className="mb-10 max-w-[40ch]">
          <p className="occhiello">Configura</p>
          <h2 className="h2">Il tuo paio,<br />prima di esistere.</h2>
          <p className="corpo mt-4">{cfg.attesa}.</p>
        </Entra>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* anteprima */}
          <div className="relative h-[52svh] min-h-[340px] cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing"
               style={{ background: "var(--campo-600)", touchAction: "pan-y" }}>
            {monta && webgl ? (
              <Scudo ripiego={<RipiegoScena nota="L'anteprima dal vivo non e' disponibile: qui resta la fotografia. Le scelte qui accanto restano valide." />}>
                <Visore
                  alt={`Sandalo due occhi in ${stato.pellame.toLowerCase()} colore ${stato.colore.toLowerCase()}, vista tridimensionale`}
                  tinte={tinte}
                  className="visore"
                />
              </Scudo>
            ) : (
              <RipiegoScena nota={webgl ? undefined : "L'anteprima dal vivo ha bisogno di WebGL: qui resta la fotografia. Le scelte qui accanto restano valide."} />
            )}
            {webgl && (
              <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[.6rem] uppercase tracking-[.2em]"
                 style={{ color: "var(--campo-300)" }}>Trascina per girarlo · pizzica per avvicinarti</p>
            )}
          </div>

          {/* scelte */}
          <Entra delay={100}>
            <Gruppo titolo="01 · Pellame">
              <div className="flex flex-wrap gap-2">
                {cfg.pellami.map((p) => (
                  <button key={p} onClick={() => scegli("pellame")(p)} aria-pressed={stato.pellame === p}
                          className="min-h-[44px] rounded-full px-4 text-[.78rem] transition-colors"
                          style={stato.pellame === p
                            ? { background: "var(--campo-100)", color: "var(--campo-900)" }
                            : { border: "1px solid rgba(241,234,230,.45)" }}>
                    {p}
                  </button>
                ))}
              </div>
            </Gruppo>

            <Gruppo titolo="02 · Colore della tomaia">
              <div className="flex flex-wrap gap-2.5">
                {cfg.coloriProvvisori.map((c) => (
                  <button key={c.nome} onClick={() => scegli("colore")(c.nome)} aria-pressed={stato.colore === c.nome}
                          aria-label={c.nome} title={c.nome}
                          className="h-11 w-11 rounded-full transition-transform hover:scale-110"
                          style={{
                            background: c.hex,
                            outline: stato.colore === c.nome ? "2px solid var(--campo-100)" : "1px solid rgba(241,234,230,.35)",
                            outlineOffset: "3px",
                          }} />
                ))}
              </div>
              <p className="mt-3 text-[.72rem]" style={{ color: "var(--campo-300)" }}>{cfg.notaColori}</p>
            </Gruppo>

            <Gruppo titolo="03 · Fondo">
              <div className="flex flex-wrap gap-2">
                {cfg.fondi.map((f) => (
                  <button key={f.nome} onClick={() => scegli("fondo")(f.nome)} aria-pressed={stato.fondo === f.nome}
                          className="min-h-[44px] rounded-full px-4 text-[.78rem] transition-colors"
                          style={stato.fondo === f.nome
                            ? { background: "var(--campo-100)", color: "var(--campo-900)" }
                            : { border: "1px solid rgba(241,234,230,.45)" }}>
                    {f.nome}
                  </button>
                ))}
              </div>
            </Gruppo>

            <Gruppo titolo="04 · Misura" nota={cfg.notaMisure}>
              <div className="flex flex-wrap gap-1.5">
                {cfg.misure.map((m) => (
                  <button key={m} onClick={() => scegli("misura")(m)} aria-pressed={stato.misura === m}
                          className="grid h-11 w-11 place-items-center rounded-full text-[.78rem] transition-colors"
                          style={stato.misura === m
                            ? { background: "var(--campo-100)", color: "var(--campo-900)" }
                            : { border: "1px solid rgba(241,234,230,.45)" }}>
                    {m}
                  </button>
                ))}
              </div>
            </Gruppo>

            <p aria-live="polite" className="mt-6 border-t pt-4 text-[.85rem]"
               style={{ borderColor: "rgba(241,234,230,.2)", color: "var(--campo-300)" }}>
              Due Occhi in <b style={{ color: "var(--campo-100)", fontWeight: 600 }}>{stato.pellame.toLowerCase()}</b>{" "}
              colore <b style={{ color: "var(--campo-100)", fontWeight: 600 }}>{stato.colore.toLowerCase()}</b>,
              fondo <b style={{ color: "var(--campo-100)", fontWeight: 600 }}>{stato.fondo.toLowerCase()}</b>,
              misura <b style={{ color: "var(--campo-100)", fontWeight: 600 }}>{stato.misura}</b>. {cfg.attesa}.
            </p>
            <a href="#contatti" className="pillola mt-5">{cfg.cta}</a>
            <p className="mt-3 text-[.72rem]" style={{ color: "var(--campo-300)" }}>
              L&apos;indirizzo di questa pagina contiene la configurazione: copiatelo e portatelo con voi.
            </p>
          </Entra>
        </div>
      </div>
    </section>
  );
}
