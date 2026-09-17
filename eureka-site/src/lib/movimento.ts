/* La preferenza "meno movimento" letta come stato esterno: niente
   setState dentro un effetto, e se l'utente la cambia mentre guarda la
   pagina il sito se ne accorge. */
const query = () =>
  typeof window === "undefined" ? null : window.matchMedia("(prefers-reduced-motion: reduce)");

export function sottoscriviMovimento(avvisa: () => void) {
  const m = query();
  if (!m) return () => {};
  m.addEventListener("change", avvisa);
  return () => m.removeEventListener("change", avvisa);
}

export const leggiMovimentoRidotto = () => query()?.matches ?? false;
export const movimentoSulServer = () => false;
