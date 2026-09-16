"use client";
import { percorso } from "@/lib/base";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Lightformer, Environment } from "@react-three/drei";
import * as THREE from "three";

/* Anche questa parte tira dentro three.js: file separato, caricamento a
   parte, cosi' non pesa sulla prima pagina. */
const MODELLO = percorso("/eureka-due-occhi.glb");

/* dall'esterno verso l'interno: e' l'ordine in cui si svelano */
const ORDINE = ["pelle", "fodera_e_filo", "fondo"] as const;

type Parte = { mesh: THREE.Mesh };

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


export default function MacroCanvas({ avanzamento }: { avanzamento: React.RefObject<number> }) {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}
            camera={{ fov: 30, near: 0.05, far: 40 }} style={{ touchAction: "pan-y" }}>
      <Studio />
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.2, 3.4, 2]} intensity={2} />
      <Suspense fallback={null}>
        <Scarpa avanzamento={avanzamento} />
      </Suspense>
    </Canvas>
  );
}
