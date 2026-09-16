/* Quel che si vede al posto di una scena 3D: l'immagine gia' renderizzata
   fuori dal browser. Non e' un vuoto, e' la stessa scarpa. */
export default function RipiegoScena({ nota }: { nota?: string }) {
  return (
    <div className="grid h-full w-full place-items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/spin/spin-00.webp" width={820} height={486}
           alt="Il sandalo due occhi Eureka, pelle color cuoio e fondo cucito a mano"
           className="max-h-full w-auto object-contain" />
      {nota && (
        <p className="mt-3 max-w-[32ch] text-center text-[.68rem]" style={{ color: "var(--campo-300)" }}>
          {nota}
        </p>
      )}
    </div>
  );
}
