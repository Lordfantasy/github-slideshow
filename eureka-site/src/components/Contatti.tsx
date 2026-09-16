import Entra from "./Entra";
import { contatti, brand, social } from "@/lib/content";

/* Niente modulo e niente recapiti inventati: un modulo senza destinatario
   e' una promessa falsa, e i recapiti veri stanno sul sito ufficiale.
   Meglio due porte che funzionano di quattro che non portano da nessuna
   parte. */
export default function Contatti() {
  return (
    <footer id="contatti" className="py-20 md:py-28" style={{ background: "var(--campo-900)" }}>
      <div className="mx-auto w-[min(1320px,100%-2.5rem)]">
        <div className="grid gap-12 md:grid-cols-2">
          <Entra>
            <p className="occhiello">Contatti</p>
            <h2 className="h2">{contatti.titolo}</h2>
            <p className="corpo mt-5">{contatti.testo}</p>
          </Entra>

          <Entra delay={120} className="md:justify-self-end">
            <dl className="text-[.95rem]">
              <dt className="text-[.64rem] uppercase tracking-[.2em]" style={{ color: "var(--campo-300)" }}>
                Lo stabilimento
              </dt>
              <dd className="mt-1">
                {contatti.luogo.map((r) => <span key={r} className="block">{r}</span>)}
              </dd>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="pillola" href={contatti.recapiti.href} target="_blank" rel="noopener">
                {contatti.recapiti.etichetta}
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              {social.map((s) => (
                <a key={s.nome} className="pillola-vuota" href={s.href} target="_blank" rel="noopener">
                  {s.nome}
                </a>
              ))}
            </div>
          </Entra>
        </div>

        <p className="mt-16 text-[.66rem] uppercase tracking-[.16em]" style={{ color: "var(--campo-300)" }}>
          {brand.esteso} — dal {brand.dal} · Fatto a mano in Italia
        </p>
      </div>
    </footer>
  );
}
