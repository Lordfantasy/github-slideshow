"use client";
import { Component, type ReactNode } from "react";

/* Se il modello 3D non si carica — file mancante, rete caduta, WebGL che
   sparisce — l'errore non deve portarsi via anche i comandi accanto.
   Senza questo, un .glb irraggiungibile spegneva tutto il configuratore. */
export default class Scudo extends Component<
  { children: ReactNode; ripiego: ReactNode },
  { caduto: boolean }
> {
  state = { caduto: false };

  static getDerivedStateFromError() {
    return { caduto: true };
  }

  componentDidCatch(errore: unknown) {
    if (typeof console !== "undefined") {
      console.warn("[eureka] scena 3D non disponibile:", errore);
    }
  }

  render() {
    return this.state.caduto ? this.props.ripiego : this.props.children;
  }
}
