/* Prepara la copia da aprire con doppio clic.
   Due cose che la build normale non fa:
   1. percorsi relativi, perche' file:// non conosce la radice del sito;
   2. il modello .glb incorporato come data URI, perche' file:// blocca
      la lettura di un file vicino (stessa regola che protegge i browser). */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const GLB = join(OUT, "eureka-due-occhi.glb");
/* nel bundle il percorso e' composto a runtime: percorso("/eureka-due-occhi.glb").
   Sostituiamo quella chiamata con il dato vero. */
const CHIAMATA = /\(0,\s*\w+\.percorso\)\("\/eureka-due-occhi\.glb"\)/g;

const dati = "data:model/gltf-binary;base64," + readFileSync(GLB).toString("base64");

function tutti(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? tutti(p) : [p];
  });
}

let toccati = 0;
for (const f of tutti(join(OUT, "_next")).filter((f) => f.endsWith(".js"))) {
  const testo = readFileSync(f, "utf8");
  if (!CHIAMATA.test(testo)) continue;
  CHIAMATA.lastIndex = 0;
  writeFileSync(f, testo.replace(CHIAMATA, JSON.stringify(dati)));
  toccati++;
}

if (!toccati) {
  console.error("Nessun file conteneva la chiamata al modello: controllare la build.");
  process.exit(1);
}
console.log(`Modello incorporato in ${toccati} file (${(dati.length / 1024 / 1024).toFixed(2)} MB in base64).`);
