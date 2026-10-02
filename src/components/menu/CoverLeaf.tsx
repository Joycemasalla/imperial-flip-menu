import logoAsset from "@/assets/logoespaco-removebg.png";

export function CoverLeaf() {
  return (
    <article data-density="hard" className="book-page cover-page flex h-full flex-col items-center justify-center overflow-hidden p-8 text-center">
      <div className="cover-frame flex h-full w-full flex-col items-center justify-center border border-primary/40 px-6">
        <img src={logoAsset} alt="Espaço Imperial" width={559} height={447} decoding="async" className="mb-6 w-48 max-w-[78%] object-contain sm:w-56" />
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-primary">Desde sempre, à sua mesa</p>
        <h1 className="sr-only">Espaço Imperial</h1>
        <div className="my-7 h-px w-20 bg-primary/60" />
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Cardápio da casa</p>
        <p className="mt-auto max-w-xs text-xs leading-relaxed text-muted-foreground">Abra o cardápio e descubra nossos sabores.</p>
      </div>
    </article>
  );
}
