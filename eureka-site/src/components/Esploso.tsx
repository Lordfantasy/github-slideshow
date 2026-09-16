"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Lightformer, Environment } from "@react-three/drei";
import * as THREE from "three";

/* =========================================================
   Il dettaglio della costruzione Ideal.

   Qui doveva esserci l'esploso dei componenti. Non si puo' fare, e le
   due strade sono state provate entrambe:
     - allontanare i tre gruppi lascia lembi bucati, perche' sono
       porzioni della stessa superficie continua, non pezzi chiusi;
     - renderli trasparenti a turno non svela niente, perche' sono
       gusci compenetrati di colore simile.
   La causa e' una sola: il file ha GRUPPI DI MATERIALE, non parti.
   Servono mesh separate (vedi NOTE-FASE-2.md).

   Quel che il modello sa fare bene e' farsi guardare da vicino: la
   camera scorre lungo il fianco mentre si scorre la pagina, e il
   guardolo, la cucitura e gli occhietti arrivano uno alla volta.
   ========================================================= */

const MODELLO = "/eureka-due-occhi.glb";

/* dall'esterno verso l'interno: e' l'ordine in cui si svelano */
const ORDINE = ["pelle", "fodera_e_filo", "fondo"] as const;

type Parte = { mesh: THREE.Mesh };

/* Cosa si vede avvicinandosi, nell'ordine in cui la camera ci arriva. */
const TAPPE = [
  { nome: "Il guardolo", testo: "Il bordo cucito che tiene insieme tomaia e fondo." },
  { nome: "La cucitura", testo: "Punto dopo punto, con il filo cerato." },
  { nome: "Gli occhietti", testo: "I due fori in punta: il piede respira." },
] as const;

function Scarpa({ avanzamento }: { avanzamento: React.MutableRefObject<number> }) {
  const { scene } = useGLTF(MODELLO);
  const gruppo = useRef<THREE.Group>(null);

  const parti = useMemo<Parte[]>(() => {
    const clone = scene.clone(true);
    const trovate: Parte[] = [];
    const ordine: readonly string[] = ORDINE;
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const nomeMat = (m.material as THREE.Material).name;
      const base = m.material as THREE.MeshStandardMaterial;
      const mat = new THREE.MeshPhysicalMaterial({
        name: nomeMat,
        color: base.color.clone(),
        roughness: nomeMat === "fondo" ? 0.85 : 0.42,
        metalness: 0,
        vertexColors: base.vertexColors,
        clearcoat: nomeMat === "pelle" ? 0.34 : 0.05,
        clearcoatRoughness: 0.35,
        /* guscio sottile: senza questo si vede attraverso */
        side: nomeMat === "fodera_e_filo" ? THREE.DoubleSide : THREE.FrontSide,
      });
      if (nomeMat === "pelle") mat.color.set("#A8622F");
      if (nomeMat === "fondo") mat.color.set("#C9A57C");
      if (nomeMat === "fodera_e_filo") mat.color.set("#EFE0C8");
      m.material = mat;
      m.castShadow = true;
      m.receiveShadow = true;
      trovate.push({ mesh: m });
    });
    return trovate.sort(
      (a, b) => ordine.indexOf((a.mesh.material as THREE.Material).name) -
                ordine.indexOf((b.mesh.material as THREE.Material).name)
    );
  }, [scene]);

  const attuale = useRef(0);
  const { camera } = useThree();
  const mira = useMemo(() => new THREE.Vector3(), []);
  const morbido = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  useFrame(() => {
    attuale.current += (avanzamento.current - attuale.current) * 0.07;
    const p = morbido(Math.min(Math.max(attuale.current, 0), 1));
    /* da tre quarti largo a un macro sul fianco */
    camera.position.set(
      0.02 + p * 0.50,
      0.42 - p * 0.26,
      2.25 - p * 1.72
    );
    mira.set(0, 0.04 + p * 0.09, p * 0.04);
    camera.lookAt(mira);
    if (gruppo.current) gruppo.current.rotation.y = 3.66 + p * 0.62;
  });

  return (
    <group ref={gruppo} position={[0, -0.24, 0]}>
      {parti.map((parte, i) => (
        <primitive key={i} object={parte.mesh} />
      ))}
    </group>
  );
}

/* studio: pannelli rettangolari, riflessi da foto di prodotto */
function Studio() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={7} color="#FFF4E6" position={[2.6, 2.5, 2]} scale={[3.6, 2.2, 1]} target={[0, 0.3, 0]} />
      <Lightformer intensity={2} color="#E6EEFF" position={[-3.2, 1.3, 1.3]} scale={[3, 3, 1]} target={[0, 0.3, 0]} />
      <Lightformer intensity={4.5} color="#FFD9A0" position={[-1.1, 1.9, -3]} scale={[2.2, 3.6, 1]} target={[0, 0.3, 0]} />
      <Lightformer intensity={1.4} color="#FFFFFF" position={[0, 4.4, 0]} scale={[6, 6, 1]} target={[0, 0.3, 0]} />
    </Environment>
  );
}

export default function Esploso() {
  const sezione = useRef<HTMLDivElement>(null);
  const avanzamento = useRef(0);
  const [monta, setMonta] = useState(false);

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      avanzamento.current = 1;
      sezione.current?.style.setProperty("--p", "1");
      return;
    }
    const el = sezione.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const corsa = r.height - window.innerHeight;
      avanzamento.current = corsa > 0 ? Math.min(Math.max(-r.top / corsa, 0), 1) : 0;
      el.style.setProperty("--p", String(avanzamento.current));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <div ref={sezione} className="relative h-[260svh]" id="esploso">
      <div className="sticky top-0 grid h-svh place-items-center overflow-hidden">
        <div className="relative h-[70svh] w-full max-w-[1100px]">
          {monta ? (
            <Canvas
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
              camera={{ fov: 30, near: 0.05, far: 40 }}
              style={{ touchAction: "pan-y" }}
            >
              <Studio />
              <ambientLight intensity={0.35} />
              <directionalLight position={[2.2, 3.4, 2]} intensity={2} />
              <Suspense fallback={null}>
                <Scarpa avanzamento={avanzamento} />
              </Suspense>
            </Canvas>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/spin/spin-00.webp" alt="Il sandalo due occhi" className="mx-auto h-full w-auto object-contain opacity-60" />
          )}
        </div>
        <ul className="pointer-events-none absolute inset-x-0 bottom-16 mx-auto grid w-[min(1100px,100%-2.5rem)] grid-cols-3 gap-4 text-center">
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
