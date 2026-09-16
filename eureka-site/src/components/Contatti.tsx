"use client";
import { useState } from "react";
import Entra from "./Entra";
import { contatti, brand, social } from "@/lib/content";

/* Il form non ha ancora un destinatario: senza endpoint un invio finto
   sarebbe una bugia, quindi lo dichiara e lascia il testo copiabile. */
export default function Contatti() {
  const [inviato, setInviato] = useState(false);

  return (
    <footer id="contatti" className="py-20 md:py-28" style={{ background: "var(--campo-900)" }}>
      <div className="mx-auto grid w-[min(1320px,100%-2.5rem)] gap-12 md:grid-cols-2">
        <Entra>
          <p className="occhiello">Contatti</p>
          <h2 className="h2">{contatti.titolo}</h2>
          <dl className="mt-8 space-y-3 text-[.92rem]">
            <div>
              <dt className="text-[.64rem] uppercase tracking-[.2em]" style={{ color: "var(--campo-300)" }}>Dove</dt>
              <dd>{contatti.luogo.join(" · ")}</dd>
            </div>
            <div>
              <dt className="text-[.64rem] uppercase tracking-[.2em]" style={{ color: "var(--campo-300)" }}>Telefono</dt>
              <dd><span className="segnaposto">{contatti.telefono}</span></dd>
            </div>
            <div>
              <dt className="text-[.64rem] uppercase tracking-[.2em]" style={{ color: "var(--campo-300)" }}>E-mail</dt>
              <dd><span className="segnaposto">{contatti.email}</span></dd>
            </div>
            <div>
              <dt className="text-[.64rem] uppercase tracking-[.2em]" style={{ color: "var(--campo-300)" }}>Showroom</dt>
              <dd><span className="segnaposto">{contatti.showroom}</span></dd>
            </div>
          </dl>
          <ul className="mt-8 flex gap-4">
            {social.map((s) => (
              <li key={s.nome}>
                <a href={s.href} target="_blank" rel="noopener" className="pillola-vuota">{s.nome}</a>
              </li>
            ))}
          </ul>
        </Entra>

        <Entra delay={120}>
          <form
            className="grid gap-4"
            onSubmit={(e) => { e.preventDefault(); setInviato(true); }}
          >
            <label className="grid gap-1.5">
              <span className="text-[.68rem] uppercase tracking-[.18em]" style={{ color: "var(--campo-300)" }}>Nome</span>
              <input required name="nome" autoComplete="name"
                     className="min-h-[48px] rounded-xl px-4 outline-none focus-visible:outline-3"
                     style={{ background: "var(--campo-700)", border: "1px solid rgba(241,234,230,.3)" }} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[.68rem] uppercase tracking-[.18em]" style={{ color: "var(--campo-300)" }}>E-mail</span>
              <input required type="email" name="email" autoComplete="email"
                     className="min-h-[48px] rounded-xl px-4 outline-none focus-visible:outline-3"
                     style={{ background: "var(--campo-700)", border: "1px solid rgba(241,234,230,.3)" }} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[.68rem] uppercase tracking-[.18em]" style={{ color: "var(--campo-300)" }}>Messaggio</span>
              <textarea required name="messaggio" rows={5}
                        className="rounded-xl p-4 outline-none focus-visible:outline-3"
                        style={{ background: "var(--campo-700)", border: "1px solid rgba(241,234,230,.3)" }} />
            </label>
            <p className="segnaposto">[DA FORNIRE: indirizzo a cui recapitare il modulo]</p>
            <button type="submit" className="pillola justify-center">Invia</button>
            <p aria-live="polite" className="text-[.85rem]" style={{ color: "var(--campo-300)" }}>
              {inviato
                ? "Il modulo non ha ancora un destinatario: il messaggio non e' stato inviato. Scrivete intanto ai recapiti qui accanto."
                : ""}
            </p>
          </form>
        </Entra>
      </div>

      <p className="mx-auto mt-16 w-[min(1320px,100%-2.5rem)] text-[.66rem] uppercase tracking-[.16em]"
         style={{ color: "var(--campo-300)" }}>
        {brand.esteso} — dal {brand.dal} · Fatto a mano in Italia
      </p>
    </footer>
  );
}
