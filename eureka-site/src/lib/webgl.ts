/* Rilevamento WebGL, una volta sola per pagina.
   Letto con useSyncExternalStore: sul server si assume disponibile, sul
   client si verifica davvero. Cosi' non serve un setState dentro un
   effetto, che innescherebbe un secondo disegno inutile. */
let esito: boolean | null = null;

function verifica(): boolean {
  if (esito !== null) return esito;
  try {
    const c = document.createElement("canvas");
    esito = !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    esito = false;
  }
  return esito;
}

const nessunCambio = () => () => {};

export function leggiWebGL() { return verifica(); }
export function suServer() { return true; }
export const sottoscrivi = nessunCambio;
