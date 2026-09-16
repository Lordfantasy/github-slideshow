"use client";
import { percorso } from "@/lib/base";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Lightformer, Environment } from "@react-three/drei";
import * as THREE from "three";
import { configuratore as cfg } from "@/lib/content";
import type { Stato } from "../tipi";

/* Questa parte tira dentro three.js, R3F e drei: sta in un file suo e si
   carica solo quando serve, cosi' la prima pagina non li paga. */
const MODELLO = percorso("/eureka-due-occhi.glb");

/* I COLOR_0 del modello portano la grana della pelle e hanno luminanza
   media 0,235: il colore del materiale ci si moltiplica sopra e scurirebbe
   di oltre quattro volte. Lo compensiamo, lasciando un residuo di quel
   bruno — e' cosi' che si comporta una pelle tinta davvero. */
const GRANA = 2.4;

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

  const fermoRichiesto = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useFrame((_, dt) => {
    /* riprende a girare da solo dopo due secondi che nessuno tocca,
       ma non se e' stato chiesto meno movimento */
    fermo.current += dt;
    if (!fermoRichiesto && fermo.current > 2) bersaglio.current += dt * 0.14;
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


export default function SandaloCanvas({ stato }: { stato: Stato }) {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ fov: 30, position: [0, 0.34, 2.1] }}>
      <Studio />
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.2, 3.4, 2]} intensity={2} />
      <Suspense fallback={null}>
        <Sandalo stato={stato} />
      </Suspense>
    </Canvas>
  );
}
