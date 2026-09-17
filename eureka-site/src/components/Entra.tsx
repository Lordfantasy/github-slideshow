"use client";
import { useEffect, useRef, type ReactNode } from "react";

/* Comparsa allo scorrimento, una volta sola. */
export default function Entra({ children, delay = 0, className = "" }:
  { children: ReactNode; delay?: number; className?: string }) {
  const rif = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rif.current;
    if (!el) return;
    const io = new IntersectionObserver((voci) => {
      voci.forEach((v) => {
        if (v.isIntersecting) { el.classList.add("dentro"); io.unobserve(el); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={rif} className={`entra ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
