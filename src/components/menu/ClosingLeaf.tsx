import logoAsset from "@/assets/logoespaco-removebg.png";

export function ClosingLeaf() {
  return (
    <article data-density="hard" className="book-page back-cover flex h-full flex-col items-center justify-center p-10 text-center">
      <img src={logoAsset} alt="Espaço Imperial" width={559} height={447} loading="lazy" decoding="async" className="mb-7 w-40 max-w-[75%] object-contain" />
      <p className="font-display text-4xl text-foreground">Bom apetite</p>
      <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">Quando decidir, é só chamar um de nossos garçons.</p>
      <p className="mt-10 text-[9px] uppercase tracking-[0.25em] text-primary">Espaço Imperial</p>
    </article>
  );
}
