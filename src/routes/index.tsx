import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Users, X } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import artesanaisImage from "@/assets/artesanais.jpg";
import bagueteImage from "@/assets/baguete.jpg";
import bebidasImage from "@/assets/bebidas.jpg";
import chapasImage from "@/assets/chapas.jpg";
import docesImage from "@/assets/doces.jpg";
import picanhaImage from "@/assets/picanha.jpg";
import pizzasImage from "@/assets/pizzas.jpg";
import porcoesImage from "@/assets/porcoes.jpg";
import tradicionaisImage from "@/assets/tradicionais.jpg";
import logoAsset from "@/assets/espaco-imperial-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import rawMenu from "@/data/menuData.json";
import { cn } from "@/lib/utils";

type Option = { label: string; price: number };
type MenuItem = {
  id: string;
  name: string;
  avatar: string;
  price: number | null;
  options: Option[];
  desc: string;
  imageUrl: string;
  serves?: string | null;
  highlight?: boolean;
};
type Category = {
  id: string;
  title: string;
  navLabel: string;
  subtitle?: string;
  items: MenuItem[];
};
type MenuPage = { category: Category; items: MenuItem[]; part: number; parts: number };
type PageFlipApi = {
  loadFromHTML: (items: HTMLElement[]) => void;
  flipNext: () => void;
  flipPrev: () => void;
  flip: (page: number) => void;
  getCurrentPageIndex: () => number;
  on: (eventName: string, callback: (event: { data: number | string | boolean | object }) => void) => PageFlipApi;
  destroy: () => void;
};

const images: Record<string, string> = {
  artesanais: artesanaisImage,
  tradicionais: tradicionaisImage,
  pizzas: pizzasImage,
  "pizzas-doces": docesImage,
  porcoes: porcoesImage,
  baguete: bagueteImage,
  chapas: chapasImage,
  "picanha-na-pedra": picanhaImage,
  bebidas: bebidasImage,
};

const menu = rawMenu as Category[];
const PAGE_SIZE = 4;
const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardápio — Espaço Imperial" },
      { name: "description", content: "Conheça os sabores, porções, pizzas, bebidas e pratos do Espaço Imperial." },
      { property: "og:title", content: "Cardápio — Espaço Imperial" },
      { property: "og:description", content: "Folheie o cardápio completo do Espaço Imperial e escolha o seu pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuBook,
});

function MenuBook() {
  const pages = useMemo<MenuPage[]>(() => menu.flatMap((category) => {
    const parts = Math.ceil(category.items.length / PAGE_SIZE);
    return Array.from({ length: parts }, (_, part) => ({
      category,
      items: category.items.slice(part * PAGE_SIZE, (part + 1) * PAGE_SIZE),
      part,
      parts,
    }));
  }), []);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<{ item: MenuItem; category: Category } | null>(null);
  const [bookReady, setBookReady] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlipApi | null>(null);
  const active = page > 0 && page <= pages.length ? pages[page - 1] : null;
  const lastPage = pages.length + 1;

  const go = (next: number) => {
    const target = Math.max(0, Math.min(lastPage, next));
    if (target === page || !pageFlipRef.current) return;
    pageFlipRef.current.flip(target);
  };

  const goCategory = (id: string) => {
    const target = pages.findIndex((entry) => entry.category.id === id);
    if (target >= 0) go(target + 1);
  };

  useEffect(() => {
    const mount = mountRef.current;
    const source = sourceRef.current;
    if (!mount || !source) return;

    let disposed = false;
    let instance: PageFlipApi | null = null;
    let touchStart: { x: number; y: number } | null = null;
    let lastSwipeAt = 0;
    const host = document.createElement("div");
    host.className = "flipbook-host";
    mount.appendChild(host);

    const onProductClick = (event: MouseEvent) => {
      if (performance.now() - lastSwipeAt < 350) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-menu-item]") : null;
      const itemId = target?.dataset["menuItem"];
      const categoryId = target?.dataset["category"];
      if (!itemId || !categoryId) return;
      const category = menu.find((entry) => entry.id === categoryId);
      const item = category?.items.find((entry) => entry.id === itemId);
      if (category && item) setSelected({ item, category });
    };
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touchStart || !touch) {
        touchStart = null;
        return;
      }

      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) <= 40 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;

      lastSwipeAt = performance.now();
      if (dx > 40) pageFlipRef.current?.flipPrev();
      else if (dx < -40) pageFlipRef.current?.flipNext();
    };
    const onTouchCancel = () => {
      touchStart = null;
    };
    mount.addEventListener("click", onProductClick);
    mount.addEventListener("touchstart", onTouchStart, { passive: true });
    mount.addEventListener("touchend", onTouchEnd, { passive: true });
    mount.addEventListener("touchcancel", onTouchCancel, { passive: true });

    void import("page-flip").then(({ PageFlip }) => {
      if (disposed) return;
      const pageElements = Array.from(source.children).map((element) => element.cloneNode(true) as HTMLElement);
      instance = new PageFlip(host, {
        width: 520,
        height: 700,
        size: "stretch",
        minWidth: 280,
        maxWidth: 560,
        minHeight: 390,
        maxHeight: 760,
        drawShadow: true,
        flippingTime: 525,
        usePortrait: true,
        autoSize: true,
        maxShadowOpacity: 0.35,
        showCover: true,
        mobileScrollSupport: true,
        clickEventForward: true,
        useMouseEvents: true,
        swipeDistance: 18,
        showPageCorners: true,
        disableFlipByClick: true,
      });
      instance.loadFromHTML(pageElements);
      instance.on("flip", (event: { data: number | string | boolean | object }) => {
        if (typeof event.data === "number") {
          setPage((current) => current === event.data ? current : event.data as number);
        }
      });
      pageFlipRef.current = instance;
      setBookReady(true);
    });

    return () => {
      disposed = true;
      mount.removeEventListener("click", onProductClick);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchend", onTouchEnd);
      mount.removeEventListener("touchcancel", onTouchCancel);
      pageFlipRef.current = null;
      if (instance) instance.destroy();
      else host.remove();
    };
  }, [pages]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selected && event.key === "Escape") setSelected(null);
      else if (!selected && event.key === "ArrowRight") pageFlipRef.current?.flipNext();
      else if (!selected && event.key === "ArrowLeft") pageFlipRef.current?.flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <main className="menu-shell min-h-dvh overflow-hidden bg-background text-foreground">
      <header className="brand-header grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="brand-seal grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/60 p-1">
            <img src={logoAsset.url} alt="" width={559} height={447} decoding="async" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-xl leading-none text-foreground sm:text-2xl">Espaço Imperial</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-primary">Cardápio da casa</p>
          </div>
        </div>
        <p className="hidden max-w-52 text-right text-xs leading-relaxed text-muted-foreground sm:block">
          Escolha com calma e chame o garçom para pedir.
        </p>
      </header>

      <nav aria-label="Categorias do cardápio" className="category-rail border-y border-border bg-secondary/70 px-3 py-2 sm:px-6">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {menu.map((category) => (
            <Button
              key={category.id}
              variant={active?.category.id === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => goCategory(category.id)}
              className={cn("min-h-11 shrink-0 rounded-full px-4", active?.category.id === category.id && "shadow-gold")}
            >
              {category.id === "pizzas-doces" ? "Doces" : category.navLabel}
            </Button>
          ))}
        </div>
      </nav>

      <section
        className="book-stage relative mx-auto flex w-full max-w-6xl items-center px-2 py-3 sm:px-12 sm:py-5"
      >
        <Button aria-label="Página anterior" title="Página anterior" variant="ghost" size="icon" onClick={() => pageFlipRef.current?.flipPrev()} disabled={!bookReady || page === 0} className="book-arrow absolute left-2 z-20 hidden size-11 rounded-full sm:inline-flex">
          <ChevronLeft className="size-5" />
        </Button>

        <div ref={mountRef} className={cn("flipbook-mount mx-auto w-full", !bookReady && "is-loading")} aria-label="Cardápio em formato de livro" />
        <div ref={sourceRef} hidden aria-hidden="true">
          <BookSource pages={pages} />
        </div>

        <Button aria-label="Próxima página" title="Próxima página" variant="ghost" size="icon" onClick={() => pageFlipRef.current?.flipNext()} disabled={!bookReady || page === lastPage} className="book-arrow absolute right-2 z-20 hidden size-11 rounded-full sm:inline-flex">
          <ChevronRight className="size-5" />
        </Button>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-border bg-background/95 px-4 py-2 backdrop-blur sm:hidden">
        <Button aria-label="Página anterior" variant="ghost" size="icon" onClick={() => pageFlipRef.current?.flipPrev()} disabled={!bookReady || page === 0} className="size-11"><ChevronLeft className="size-5" /></Button>
        <div className="min-w-0 text-center">
          <p className="truncate text-xs font-semibold text-foreground">{page === 0 ? "Capa" : page === lastPage ? "Fim" : active?.category.navLabel}</p>
          <div className="mx-auto mt-1 h-0.5 w-full max-w-36 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${((page + 1) / (lastPage + 1)) * 100}%` }} /></div>
        </div>
        <Button aria-label="Próxima página" variant="ghost" size="icon" onClick={() => pageFlipRef.current?.flipNext()} disabled={!bookReady || page === lastPage} className="size-11"><ChevronRight className="size-5" /></Button>
      </footer>

      {selected && <ProductModal selection={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

const BookSource = memo(function BookSource({ pages }: { pages: MenuPage[] }) {
  return (
    <>
      <CoverLeaf />
      {pages.map((menuPage, index) => <MenuLeaf key={`${menuPage.category.id}-${menuPage.part}`} page={menuPage} number={index + 1} />)}
      <ClosingLeaf />
    </>
  );
});

function CoverLeaf() {
  return (
    <article data-density="hard" className="book-page cover-page flex h-full flex-col items-center justify-center overflow-hidden p-8 text-center">
      <div className="cover-frame flex h-full w-full flex-col items-center justify-center border border-primary/40 px-6">
        <img src={logoAsset.url} alt="Espaço Imperial" width={559} height={447} decoding="async" className="mb-6 w-48 max-w-[78%] object-contain sm:w-56" />
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-primary">Desde sempre, à sua mesa</p>
        <h1 className="sr-only">Espaço Imperial</h1>
        <div className="my-7 h-px w-20 bg-primary/60" />
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Cardápio da casa</p>
        <p className="mt-auto max-w-xs text-xs leading-relaxed text-muted-foreground">Abra o cardápio e descubra nossos sabores.</p>
      </div>
    </article>
  );
}

function MenuLeaf({ page, number }: { page: MenuPage; number: number }) {
  const image = images[page.category.id] ?? artesanaisImage;
  return (
    <article className="book-page menu-leaf relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative h-32 shrink-0 overflow-hidden sm:h-40 lg:h-44">
        <img src={image} alt={`Seleção de ${page.category.title}`} width={1200} height={800} loading={number === 1 ? "eager" : "lazy"} decoding="async" fetchPriority={number === 1 ? "high" : "auto"} className="h-full w-full object-cover" />
        <div className="image-shade absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 sm:px-7">
          <p className="mb-1 text-[9px] uppercase tracking-[0.3em] text-primary">Seleção imperial</p>
          <h1 className="font-display text-3xl leading-none text-foreground sm:text-4xl">{page.category.title}</h1>
          {page.parts > 1 && <p className="mt-1 text-[10px] text-foreground/80">Parte {page.part + 1} de {page.parts}</p>}
        </div>
      </div>
      <div className="menu-scroll-wrap relative min-h-0 flex-1">
        <div className="menu-scroll-area h-full overflow-y-auto px-4 pb-10 pt-3 sm:px-6 sm:pb-10 sm:pt-4">
          {page.part === 0 && page.category.subtitle && <p className="mb-3 border-l border-primary pl-3 text-[11px] leading-relaxed text-paper-foreground/80">{page.category.subtitle}</p>}
          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {page.items.map((item) => <MenuItemRow key={item.id} item={item} categoryId={page.category.id} />)}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-ink/10 px-5 py-2 text-[9px] uppercase tracking-[0.18em] text-paper-muted">
        <span>Toque para ver detalhes</span><span>{String(number).padStart(2, "0")}</span>
      </div>
    </article>
  );
}

function MenuItemRow({ item, categoryId }: { item: MenuItem; categoryId: string }) {
  const basePrice = item.price !== null ? money(item.price) : item.options.length ? `a partir de ${money(Math.min(...item.options.map((option) => option.price)))}` : "Consulte";
  return (
    <button type="button" data-menu-item={item.id} data-category={categoryId} className="menu-item group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-ink/10 py-2.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2"><h2 className="truncate font-display text-base text-paper-foreground sm:text-lg">{item.name}</h2>{item.highlight && <span className="shrink-0 text-[8px] uppercase tracking-[0.15em] text-gold-dark">Destaque</span>}</div>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-paper-foreground/80 sm:text-xs">{item.desc}</p>
      </div>
      <span className="pt-0.5 text-xs font-bold tabular-nums text-gold-dark sm:text-sm">{basePrice}</span>
    </button>
  );
}

function ClosingLeaf() {
  return <article data-density="hard" className="book-page back-cover flex h-full flex-col items-center justify-center p-10 text-center"><img src={logoAsset.url} alt="Espaço Imperial" width={559} height={447} loading="lazy" decoding="async" className="mb-7 w-40 max-w-[75%] object-contain" /><p className="font-display text-4xl text-foreground">Bom apetite</p><p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">Quando decidir, é só chamar um de nossos garçons.</p><p className="mt-10 text-[9px] uppercase tracking-[0.25em] text-primary">Espaço Imperial</p></article>;
}

function ProductModal({ selection, onClose }: { selection: { item: MenuItem; category: Category }; onClose: () => void }) {
  const startY = useRef<number | null>(null);
  const { item, category } = selection;
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="product-name" className="modal-sheet relative max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain scroll-smooth rounded-t-2xl border border-border bg-card shadow-modal sm:rounded-lg" onTouchStart={(event) => { startY.current = event.touches[0]?.clientY ?? null; }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientY; if (startY.current !== null && end !== undefined && end - startY.current > 90) onClose(); startY.current = null; }}>
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted sm:hidden" />
        <Button aria-label="Fechar detalhes" title="Fechar" variant="outline" size="icon" onClick={onClose} className="absolute right-3 top-3 z-10 size-11 rounded-full bg-background/85 backdrop-blur"><X className="size-4" /></Button>
        <div className="relative aspect-[16/10] overflow-hidden sm:rounded-t-lg"><img src={item.imageUrl} alt={item.name} width={1200} height={800} loading="eager" decoding="async" className="h-full w-full object-cover" /><div className="image-shade-soft absolute inset-0" /><p className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.25em] text-primary">{category.title}</p></div>
        <div className="p-5 sm:p-7">
          <h2 id="product-name" className="font-display text-3xl text-card-foreground sm:text-4xl">{item.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          {item.serves && <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary"><Users className="size-4" /><span>Serve {item.serves}</span></div>}
          <div className="mt-6 border-t border-border pt-4">
            {item.options.length > 0 ? <div className="space-y-2">{item.options.map((option) => <div key={option.label} className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{option.label}</span><strong className="font-display text-xl text-primary">{money(option.price)}</strong></div>)}</div> : <div className="flex items-end justify-between"><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Valor</span><strong className="font-display text-3xl text-primary">{item.price !== null ? money(item.price) : "Consulte"}</strong></div>}
          </div>
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Chame o garçom para fazer seu pedido</p>
        </div>
      </section>
    </div>
  );
}
