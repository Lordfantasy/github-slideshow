"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { percorso } from "@/lib/base";

/* =========================================================
   Il visore 3D: <model-viewer> di Google.
   La libreria sta nel pacchetto invece che su un CDN, perche' il sito
   deve funzionare anche aperto da un file, senza collegamento.
   Si carica solo quando questo componente entra in pagina.
   ========================================================= */

export type Tinte = { pelle: string; fondo: string; fodera: string };

/* Il modello porta un atlante UV con la pelle fotografata sopra: colore,
   ruvidezza e normali sono texture, non piu' colore nei vertici. Cambiare
   tinta vuol dire moltiplicare quella texture, e la texture e' gia'
   pigmentata di bordeaux. Per puntare a un colore diverso si divide prima
   per la media dell'atlante, misurata sulle UV dei vertici di ogni
   materiale: vengono tutte e tre quasi uguali perche' le isole dei tre
   materiali sono mescolate nello stesso atlante. */
const MEDIA = [0.209, 0.115, 0.06];

/* Oltre questo il moltiplicatore slava l'immagine invece di tingerla. */
const TETTO = 8;

/* I nomi dei materiali dentro il .glb, e a quale scelta rispondono.
   DETAIL_ORIGINAL (fodera, cuciture, occhielli) resta fuori di proposito:
   nell'atlante e' gia' crema fotografica, giusta com'e', e non e' una
   scelta del configuratore. Tingerla la manderebbe fuori scala. */
const MATERIALE = {
  UPPER_ORIGINAL: "pelle",
  SOLE_ORIGINAL: "fondo",
} as const;

function versoFattore(hex: string): [number, number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  /* da sRGB a lineare, che e' lo spazio di baseColorFactor */
  const canale = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const t = [canale((n >> 16) & 255), canale((n >> 8) & 255), canale(n & 255)];
  return [
    Math.min(t[0] / MEDIA[0], TETTO),
    Math.min(t[1] / MEDIA[1], TETTO),
    Math.min(t[2] / MEDIA[2], TETTO),
    1,
  ];
}

type Props = {
  tinte?: Tinte;
  /* 0 = tre quarti largo, 1 = macro sul fianco */
  avvicinamento?: number;
  autoRuota?: boolean;
  alt: string;
  className?: string;
  style?: CSSProperties;
};

export default function Visore({
  tinte, avvicinamento, autoRuota = true, alt, className, style,
}: Props) {
  const mv = useRef<HTMLElement & {
    model?: {
      materials: {
        name: string;
        pbrMetallicRoughness: {
          setBaseColorFactor: (v: number[]) => void;
        };
      }[];
    };
  }>(null);

  /* la libreria definisce il custom element: import solo nel browser */
  useEffect(() => { import("@google/model-viewer"); }, []);

  /* colori e riflessi: si applicano al carico e a ogni cambio di scelta */
  useEffect(() => {
    const el = mv.current;
    if (!el) return;
    const dipingi = () => {
      const materiali = el.model?.materials;
      if (!materiali) return;
      for (const m of materiali) {
        if (!tinte) continue;
        const parte = MATERIALE[m.name as keyof typeof MATERIALE];
        if (parte) m.pbrMetallicRoughness.setBaseColorFactor(versoFattore(tinte[parte]));
      }
    };
    dipingi();
    el.addEventListener("load", dipingi);
    return () => el.removeEventListener("load", dipingi);
  }, [tinte]);

  /* avvicinamento guidato dallo scorrimento */
  useEffect(() => {
    const el = mv.current;
    if (el == null || avvicinamento == null) return;
    const p = Math.min(Math.max(avvicinamento, 0), 1);
    const gradi = 210 + p * 42;
    const raggio = 100 - p * 45;
    el.setAttribute("camera-orbit", `${gradi}deg ${78 - p * 6}deg ${raggio}%`);
  }, [avvicinamento]);

  /* La barra di avanzamento vive fuori da React: il componente e' un
     elemento nativo e il suo evento non passa per il DOM virtuale. */
  useEffect(() => {
    const el = mv.current;
    if (!el) return;
    const barra = el.querySelector<HTMLElement>(".barra");
    const guscio = el.querySelector<HTMLElement>(".avanzamento");
    if (!barra || !guscio) return;
    const onProgress = (e: Event) => {
      const q = (e as CustomEvent<{ totalProgress: number }>).detail.totalProgress;
      barra.style.width = `${q * 100}%`;
      guscio.classList.toggle("finito", q === 1);
    };
    el.addEventListener("progress", onProgress);
    return () => el.removeEventListener("progress", onProgress);
  }, []);

  return (
    <model-viewer
      ref={mv}
      src={percorso("/eureka-due-occhi.glb")}
      alt={alt}
      class={className}
      style={style}
      camera-controls=""
      touch-action="pan-y"
      shadow-intensity="1.5"
      shadow-softness="0.5"
      environment-image="neutral"
      exposure="1.15"
      tone-mapping="commerce"
      camera-orbit="210deg 78deg 100%"
      field-of-view="30deg"
      min-camera-orbit="auto auto 55%"
      max-camera-orbit="auto auto 160%"
      {...(autoRuota
        ? { "auto-rotate": "", "auto-rotate-delay": "1500", "rotation-per-second": "20deg" }
        : {})}
    >
      <div slot="progress-bar" className="avanzamento"><div className="barra" /></div>
    </model-viewer>
  );
}
