"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/* Le 32 pose sono renderizzate fuori dal browser a 1600px e rimpicciolite:
   il dettaglio della pelle non sfarfalla come farebbe in tempo reale.
   Trascinare scorre le pose, quindi la scarpa si gira comunque. */
const N = 32;
const src = (i: number) => `/spin/spin-${String(i).padStart(2, "0")}.webp`;

export default function SpinViewer({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [caricati, setCaricati] = useState<boolean[]>(() => {
    const a = new Array(N).fill(false);
    a[0] = true;
    return a;
  });
  const angolo = useRef(0);
  const toccato = useRef(false);
  const trascina = useRef<number | null>(null);

  /* prima una posa ogni quattro, cosi' trascinare funziona subito */
  useEffect(() => {
    const ordine = [
      ...Array.from({ length: N }, (_, i) => i).filter((i) => i % 4 === 0 && i > 0),
      ...Array.from({ length: N }, (_, i) => i).filter((i) => i % 4 !== 0),
    ];
    let vivo = true;
    ordine.forEach((i) => {
      const img = new Image();
      img.onload = () => vivo && setCaricati((c) => (c[i] ? c : Object.assign([...c], { [i]: true })));
      img.src = src(i);
    });
    return () => { vivo = false; };
  }, []);

  const mostra = useCallback((a: number) => {
    angolo.current = a;
    const grezzo = Math.round((a / (Math.PI * 2)) * N);
    let i = ((grezzo % N) + N) % N;
    setCaricati((c) => {
      if (!c[i]) {
        for (let d = 1; d < N; d++) {
          if (c[(i + d) % N]) { i = (i + d) % N; break; }
          if (c[(i - d + N) % N]) { i = (i - d + N) % N; break; }
        }
      }
      setIndice(i);
      return c;
    });
  }, []);

  /* giro lento finche' nessuno tocca, per far capire che si puo' */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const passo = (t: number) => {
      raf = requestAnimationFrame(passo);
      if (toccato.current || document.hidden) return;
      mostra(((t - t0) / 1000) * 0.2);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [mostra]);

  return (
    <div
      ref={host}
      className={`relative select-none ${className}`}
      style={{ touchAction: "pan-y", cursor: trascina.current !== null ? "grabbing" : "grab" }}
      tabIndex={0}
      role="img"
      aria-label="Il sandalo due occhi ripreso in trentadue pose. Trascina, o usa le frecce sinistra e destra, per girarlo."
      onPointerDown={(e) => {
        toccato.current = true;
        trascina.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (trascina.current === null) return;
        const dx = e.clientX - trascina.current;
        trascina.current = e.clientX;
        mostra(angolo.current + (dx / (window.innerWidth * 0.5)) * Math.PI * 2);
      }}
      onPointerUp={() => { trascina.current = null; }}
      onPointerCancel={() => { trascina.current = null; }}
      onKeyDown={(e) => {
        const passo = (Math.PI * 2) / N;
        if (e.key === "ArrowLeft") mostra(angolo.current - passo);
        else if (e.key === "ArrowRight") mostra(angolo.current + passo);
        else return;
        toccato.current = true;
        e.preventDefault();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src(indice)}
        width={820}
        height={486}
        alt="Il sandalo due occhi Eureka, pelle color cuoio e fondo cucito a mano"
        className="w-full h-auto"
        draggable={false}
        fetchPriority="high"
      />
    </div>
  );
}
