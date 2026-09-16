"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Lightformer, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useSearchParams } from "next/navigation";
import Entra from "./Entra";
import { configuratore as cfg } from "@/lib/content";

const MODELLO = "/eureka-due-occhi.glb";

/* I COLOR_0 del modello portano la grana della pelle e hanno luminanza
   media 0,235: il colore del materiale ci si moltiplica sopra e scurirebbe
   di oltre quattro volte. Lo compensiamo, lasciando un residuo di quel
   bruno — e' cosi' che si comporta una pelle tinta davvero. */
const GRANA = 2.4;

type Stato = {
  pellame: string;
  colore: string;
  fondo: string;
  misura: string;
};

function Sandalo({ stato }: { stato: Stato }) {
  const { scene } = useGLTF(MODELLO);
  const tela = useThree((s) => s.gl.domElement);
  const gruppo = useRef<THREE.Group>(null);

  /* Si prendono le tre geometrie una volta sola, in sola lettura. I
     materiali poi si dichiarano in JSX: niente mutazioni a mano, e il
     cambio colore resta immediato perche' e' un normale ri-render. */
  const pezzi = useMemo(() => {
    const out: { nome: string; geometria: THREE.BufferGeometry }[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      out.push({ nome: (m.material as THREE.Material).name, geometria: m.geometry });
    });
    return out;
  }, [scene]);

  const tinte = useMemo(() => {
    const c = cfg.coloriProvvisori.find((x) => x.nome === stato.colore) ?? cfg.coloriProvvisori[0];
    const f = cfg.fondi.find((x) => x.nome === stato.fondo) ?? cfg.fondi[0];
    return {
      pelle: new THREE.Color(c.hex).multiplyScalar(GRANA),
      fondo: new THREE.Color(f.hex).multiplyScalar(GRANA),
      fodera_e_filo: new THREE.Color("#EFE0C8").multiplyScalar(GRANA * 0.92),
    } as Record<string, THREE.Color>;
  }, [stato.colore, stato.fondo]);

  /* il pellame non cambia il colore, cambia come la luce ci rimbalza */
  const resa = useMemo(() => {
    const lucida = stato.pellame === "Vernice" || stato.pellame === "Laminato";
    const opaca = stato.pellame === "Camoscio" || stato.pellame === "Velluto"
               || stato.pellame === "Montone lavato";
    return {
      roughness: lucida ? 0.16 : opaca ? 0.78 : 0.42,
      clearcoat: lucida ? 0.85 : opaca ? 0 : 0.34,
    };
  }, [stato.pellame]);

  /* Il trascinamento vive qui dentro: la rotazione e' tutta della scena,
     senza canali mutabili condivisi con il componente che la contiene. */
  const bersaglio = useRef(3.66);
  const attuale = useRef(3.66);
  const fermo = useRef(0);

  useEffect(() => {
    let ultimo: number | null = null;
    const giu = (e: PointerEvent) => { ultimo = e.clientX; tela.setPointerCapture(e.pointerId); };
    const muovi = (e: PointerEvent) => {
      if (ultimo === null) return;
      bersaglio.current += ((e.clientX - ultimo) / window.innerWidth) * Math.PI * 2;
      ultimo = e.clientX;
      fermo.current = 0;
    };
    const su = () => { ultimo = null; };
    tela.addEventListener("pointerdown", giu);
    tela.addEventListener("pointermove", muovi);
    tela.addEventListener("pointerup", su);
    tela.addEventListener("pointercancel", su);
    return () => {
      tela.removeEventListener("pointerdown", giu);
      tela.removeEventListener("pointermove", muovi);
      tela.removeEventListener("pointerup", su);
      tela.removeEventListener("pointercancel", su);
    };
  }, [tela]);

  useFrame((_, dt) => {
    /* riprende a girare da solo dopo due secondi che nessuno tocca */
    fermo.current += dt;
    if (fermo.current > 2) bersaglio.current += dt * 0.14;
    attuale.current += (bersaglio.current - attuale.current) * 0.1;
    if (gruppo.current) gruppo.current.rotation.y = attuale.current;
  });

  return (
    <group ref={gruppo} position={[0, -0.24, 0]}>
      {pezzi.map((p, i) => (
        <mesh key={i} geometry={p.geometria} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={tinte[p.nome] ?? tinte.pelle}
            vertexColors
            metalness={0}
            roughness={p.nome === "fondo" ? 0.85 : p.nome === "pelle" ? resa.roughness : 0.75}
            clearcoat={p.nome === "pelle" ? resa.clearcoat : 0.05}
            clearcoatRoughness={0.35}
            side={p.nome === "fodera_e_filo" ? THREE.DoubleSide : THREE.FrontSide}
          />
        </mesh>
      ))}
    </group>
  );
}

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
            {monta ? (
              <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ fov: 30, position: [0, 0.34, 2.1] }}>
                <Studio />
                <ambientLight intensity={0.35} />
                <directionalLight position={[2.2, 3.4, 2]} intensity={2} />
                <Suspense fallback={null}>
                  <Sandalo stato={stato} />
                </Suspense>
              </Canvas>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src="/spin/spin-00.webp" alt="" className="h-full w-full object-contain opacity-50" />
            )}
            <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[.6rem] uppercase tracking-[.2em]"
               style={{ color: "var(--campo-300)" }}>Trascina per girarlo</p>
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
              <p className="segnaposto mt-3">{cfg.avvisoColori}</p>
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
          </Entra>
        </div>
      </div>
    </section>
  );
}
