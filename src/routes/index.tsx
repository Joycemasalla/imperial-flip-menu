import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Users, X, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, UIEvent as ReactUIEvent } from "react";

import artesanaisImage from "@/assets/artesanais.jpg";
import bagueteImage from "@/assets/baguete.jpg";
import bebidasImage from "@/assets/bebidas.jpg";
import chapasImage from "@/assets/chapas.jpg";
import docesImage from "@/assets/doces.jpg";
import picanhaImage from "@/assets/picanha.jpg";
import pizzasImage from "@/assets/pizzas.jpg";
import porcoesImage from "@/assets/porcoes.jpg";
import tradicionaisImage from "@/assets/tradicionais.jpg";
import logoAsset from "@/assets/logoespaco-removebg.png";
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
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  startedAt: number;
  axis: "pending" | "horizontal" | "vertical";
  direction: "next" | "prev" | null;
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
  const pages = menu;
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<{ item: MenuItem; category: Category } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const currentLeafRef = useRef<HTMLDivElement>(null);
  const previousLeafRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const active = page > 0 && page <= pages.length ? pages[page - 1] : null;
  const lastPage = pages.length + 1;

  const desktopRef = useRef(false);
  const widthRef = useRef(1);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      desktopRef.current = query.matches;
      widthRef.current = mountRef.current?.clientWidth || 1;
    };
    sync();
    query.addEventListener("change", sync);
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const resetLeaf = useCallback((leaf: HTMLDivElement | null) => {
    if (!leaf) return;
    leaf.style.transition = "none";
    leaf.style.transform = "rotateY(0deg)";
    leaf.style.removeProperty("--fold-shadow");
    leaf.classList.remove("virtual-leaf-dragging");
  }, []);

  const go = useCallback((next: number) => {
    const target = Math.max(0, Math.min(lastPage, next));
    if (target === page || lockedRef.current) return;
    lockedRef.current = true;
    const direction = target > page ? "next" : "prev";
    const leaf = direction === "next" ? currentLeafRef.current : previousLeafRef.current;
    if (!leaf) {
      setPage(target);
      lockedRef.current = false;
      return;
    }
    const isDesktop = desktopRef.current;
    if (direction === "prev") leaf.style.zIndex = "5";
    leaf.classList.add("virtual-leaf-dragging");
    leaf.style.transition = "transform 260ms cubic-bezier(.22,.72,.2,1)";
    leaf.style.transform = direction === "next" ? "rotateY(-180deg)" : isDesktop ? "rotateY(180deg)" : "rotateY(0deg)";
    leaf.style.setProperty("--fold-shadow", "0.6");
    settleTimerRef.current = window.setTimeout(() => {
      setPage(target);
      lockedRef.current = false;
    }, 265);
  }, [lastPage, page]);

  const goCategory = (id: string) => {
    const target = pages.findIndex((entry) => entry.id === id);
    if (target >= 0) go(target + 1);
  };

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selected && event.key === "Escape") setSelected(null);
      else if (searchOpen && event.key === "Escape") setSearchOpen(false);
      else if (!selected && !searchOpen && event.key === "ArrowRight") go(page + 1);
      else if (!selected && !searchOpen && event.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page, selected, searchOpen]);

  useEffect(() => {
    if (active?.id) {
      const el = document.getElementById(`nav-cat-${active.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [active?.id]);

  const pendingDxRef = useRef(0);

  const paint = () => {
    frameRef.current = null;
    const drag = dragRef.current;
    if (!drag || !drag.direction) return;
    const leaf = drag.direction === "next" ? currentLeafRef.current : previousLeafRef.current;
    if (!leaf) return;
    const progress = Math.min(1, Math.abs(pendingDxRef.current) / widthRef.current);
    const angle =
      drag.direction === "next" ? -progress * 180 : desktopRef.current ? progress * 180 : -180 + progress * 180;
    leaf.style.transform = `rotateY(${angle}deg)`;
    leaf.style.setProperty("--fold-shadow", (Math.sin(progress * Math.PI) * 0.6).toFixed(2));
  };

  const updateDrag = (dx: number) => {
    pendingDxRef.current = dx;
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(paint);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (lockedRef.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    widthRef.current = mountRef.current?.clientWidth || 1;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, startedAt: performance.now(), axis: "pending", direction: null };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.axis === "vertical") return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    drag.lastX = event.clientX;
    if (drag.axis === "pending") {
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        drag.axis = "vertical";
        return;
      }
      drag.axis = "horizontal";
      drag.direction = dx < 0 ? "next" : "prev";
      if ((drag.direction === "next" && page === lastPage) || (drag.direction === "prev" && page === 0)) {
        drag.axis = "vertical";
        drag.direction = null;
        return;
      }
      const leaf = drag.direction === "next" ? currentLeafRef.current : previousLeafRef.current;
      if (leaf) {
        if (drag.direction === "prev") leaf.style.zIndex = "5";
        leaf.classList.add("virtual-leaf-dragging");
        leaf.style.transition = "none";
      }
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (drag.axis === "horizontal" && drag.direction) {
      const directionalDx = drag.direction === "next" ? Math.min(0, dx) : Math.max(0, dx);
      updateDrag(directionalDx);
    }
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (!drag || drag.pointerId !== event.pointerId || drag.axis !== "horizontal" || !drag.direction) return;
    const dx = drag.lastX - drag.startX;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - drag.startedAt);
    const complete = Math.abs(dx) > 40 || velocity > 0.45;
    const leaf = drag.direction === "next" ? currentLeafRef.current : previousLeafRef.current;
    if (!leaf) return;
    const direction = drag.direction;
    lockedRef.current = true;
    const isDesktop = desktopRef.current;
    leaf.style.transition = "transform 240ms cubic-bezier(.22,.72,.2,1)";
    leaf.style.transform = complete
      ? direction === "next" ? "rotateY(-180deg)" : isDesktop ? "rotateY(180deg)" : "rotateY(0deg)"
      : direction === "next" ? "rotateY(0deg)" : isDesktop ? "rotateY(0deg)" : "rotateY(-180deg)";
    leaf.style.setProperty("--fold-shadow", complete ? "0.6" : "0");
    settleTimerRef.current = window.setTimeout(() => {
      if (complete) {
        setPage((current) => Math.max(0, Math.min(lastPage, current + (direction === "next" ? 1 : -1))));
      } else {
        resetLeaf(leaf);
        leaf.style.removeProperty("z-index");
      }
      leaf.classList.remove("virtual-leaf-dragging");
      lockedRef.current = false;
    }, 245);
  };

  const renderLeaf = (index: number, eager: boolean) => {
    if (index === 0) return <CoverLeaf />;
    if (index === lastPage) return <ClosingLeaf />;
    const category = pages[index - 1];
    return category ? <MenuLeaf category={category} number={index} eager={eager} onSelect={(item) => setSelected({ item, category })} /> : null;
  };

  return (
    <main className="menu-shell min-h-dvh overflow-hidden bg-background text-foreground">
      <header className="brand-header grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="brand-seal grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/60 p-1">
            <img src={logoAsset} alt="" width={559} height={447} decoding="async" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-xl leading-none text-foreground sm:text-2xl">Espaço Imperial</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-primary">Cardápio da casa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden max-w-52 text-right text-xs leading-relaxed text-muted-foreground sm:block">
            Escolha com calma e chame o garçom para pedir.
          </p>
          <Button aria-label="Buscar" variant="outline" size="icon" className="rounded-full" onClick={() => setSearchOpen(true)}>
            <Search className="size-4" />
          </Button>
        </div>
      </header>

      <nav aria-label="Categorias do cardápio" className="category-rail border-y border-border bg-secondary/70 px-3 py-2 sm:px-6">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {menu.map((category) => (
            <Button
              key={category.id}
              id={`nav-cat-${category.id}`}
              variant={active?.id === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => goCategory(category.id)}
              className={cn("min-h-11 shrink-0 rounded-full px-4 transition-colors", active?.id === category.id && "shadow-gold")}
            >
              {category.id === "pizzas-doces" ? "Doces" : category.navLabel}
            </Button>
          ))}
        </div>
      </nav>

      <section
        className="book-stage relative mx-auto flex w-full max-w-6xl items-center px-2 py-3 sm:px-12 sm:py-5"
      >
        <Button aria-label="Página anterior" title="Página anterior" variant="ghost" size="icon" onClick={() => go(page - 1)} disabled={page === 0} className="book-arrow absolute left-2 z-20 hidden size-11 rounded-full sm:inline-flex">
          <ChevronLeft className="size-5" />
        </Button>

        <div ref={mountRef} className="flipbook-mount mx-auto w-full" aria-label="Cardápio em formato de livro" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finishDrag} onPointerCancel={finishDrag}>
          {page > 0 && (
            <div key={`previous-${page}`} ref={previousLeafRef} className="virtual-leaf virtual-leaf-previous" aria-hidden="true">
              <div className="leaf-face">{renderLeaf(page - 1, true)}</div>
              <div className="leaf-face leaf-face-back" />
            </div>
          )}
          <div key={`current-${page}`} ref={currentLeafRef} className="virtual-leaf virtual-leaf-current">
            <div className="leaf-face">{renderLeaf(page, true)}</div>
            <div className="leaf-face leaf-face-back" />
          </div>
          {page < lastPage && (
            <div key={`next-${page}`} className="virtual-leaf virtual-leaf-next" aria-hidden="true">
              <div className="leaf-face">{renderLeaf(page + 1, false)}</div>
            </div>
          )}
        </div>

        <Button aria-label="Próxima página" title="Próxima página" variant="ghost" size="icon" onClick={() => go(page + 1)} disabled={page === lastPage} className="book-arrow absolute right-2 z-20 hidden size-11 rounded-full sm:inline-flex">
          <ChevronRight className="size-5" />
        </Button>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-t border-border bg-background/95 px-4 py-1.5 backdrop-blur sm:hidden">
        <Button aria-label="Página anterior" variant="ghost" size="icon" onClick={() => go(page - 1)} disabled={page === 0} className="size-9"><ChevronLeft className="size-4" /></Button>
        <div className="min-w-0 text-center">
          <p className="truncate text-[11px] font-semibold text-foreground">{page === 0 ? "Capa" : page === lastPage ? "Fim" : active?.navLabel}</p>
          <div className="mx-auto mt-1.5 h-0.5 w-full max-w-32 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${((page + 1) / (lastPage + 1)) * 100}%` }} /></div>
        </div>
        <Button aria-label="Próxima página" variant="ghost" size="icon" onClick={() => go(page + 1)} disabled={page === lastPage} className="size-9"><ChevronRight className="size-4" /></Button>
      </footer>

      {selected && <ProductModal selection={selected} onClose={() => setSelected(null)} />}
      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          onSelect={(item, category) => {
            setSearchOpen(false);
            goCategory(category.id);
            setTimeout(() => setSelected({ item, category }), 300);
          }}
        />
      )}
    </main>
  );
}

function CoverLeaf() {
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

const updateScrollHint = (el: HTMLDivElement | null) => {
  if (!el) return;
  el.dataset["hint"] = el.scrollHeight > el.clientHeight + 4 ? "more" : "none";
};

const trackScrollHint = (event: ReactUIEvent<HTMLDivElement>) => {
  const el = event.currentTarget;
  el.dataset["hint"] = el.scrollTop + el.clientHeight >= el.scrollHeight - 4 ? "end" : "more";
};

function MenuLeaf({ category, number, eager, onSelect }: { category: Category; number: number; eager: boolean; onSelect: (item: MenuItem) => void }) {
  const image = images[category.id] ?? artesanaisImage;
  return (
    <article className="book-page menu-leaf relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative h-36 shrink-0 overflow-hidden sm:h-36 lg:h-40">
        <img src={image} alt={`Seleção de ${category.title}`} width={1200} height={800} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={number === 1 ? "high" : "auto"} className="h-full w-full object-cover" />
        <div className="image-shade absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 pb-3 sm:px-7 sm:pb-4">
          <div className="min-w-0">
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.3em] text-primary">Seleção imperial</p>
          <h1 className="font-display text-2xl leading-tight text-foreground sm:text-4xl">{category.title}</h1>
          </div>
          <p className="shrink-0 pb-1 text-[10px] uppercase tracking-[0.18em] text-foreground/75">{category.items.length} opções</p>
        </div>
      </div>
      <div className="menu-scroll-wrap relative min-h-0 flex-1">
        <div ref={updateScrollHint} onScroll={trackScrollHint} className="menu-scroll-area h-full overflow-y-auto px-4 pb-16 pt-3 sm:px-6 sm:pb-14 sm:pt-4">
          {category.subtitle && <p className="mb-3 border-l border-primary pl-3 text-[11px] leading-relaxed text-paper-foreground/80">{category.subtitle}</p>}
          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {category.items.map((item) => <MenuItemRow key={item.id} item={item} categoryId={category.id} onSelect={onSelect} />)}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-ink/10 px-5 py-2 text-[9px] uppercase tracking-[0.18em] text-paper-muted">
        <span>Toque para ver detalhes</span><span>{String(number).padStart(2, "0")}</span>
      </div>
    </article>
  );
}

function MenuItemRow({ item, categoryId, onSelect }: { item: MenuItem; categoryId: string; onSelect: (item: MenuItem) => void }) {
  const basePrice = item.price !== null ? money(item.price) : item.options.length ? `a partir de ${money(Math.min(...item.options.map((option) => option.price)))}` : "Consulte";
  const thumbnail = item.imageUrl || images[categoryId] || artesanaisImage;
  return (
    <button type="button" data-menu-item={item.id} data-category={categoryId} onClick={() => onSelect(item)} className="menu-item group grid min-h-20 w-full grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 border-b border-ink/10 py-2.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary sm:grid-cols-[4.5rem_minmax(0,1fr)]">
      <img
        src={thumbnail}
        alt=""
        width={144}
        height={144}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="size-16 shrink-0 rounded-md object-cover sm:size-18"
      />
      <div className="min-w-0">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <h2 className="line-clamp-2 font-display text-base leading-tight text-paper-foreground sm:text-lg">{item.name}</h2>
            {item.highlight && <span className="mt-0.5 block text-[8px] uppercase tracking-[0.15em] text-gold-dark">Destaque</span>}
          </div>
          <span className="max-w-24 text-right text-[11px] font-bold leading-tight tabular-nums text-gold-dark sm:max-w-28 sm:text-sm">{basePrice}</span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-paper-foreground/80 sm:text-xs">{item.desc}</p>
      </div>
    </button>
  );
}

function ClosingLeaf() {
  return <article data-density="hard" className="book-page back-cover flex h-full flex-col items-center justify-center p-10 text-center"><img src={logoAsset} alt="Espaço Imperial" width={559} height={447} loading="lazy" decoding="async" className="mb-7 w-40 max-w-[75%] object-contain" /><p className="font-display text-4xl text-foreground">Bom apetite</p><p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">Quando decidir, é só chamar um de nossos garçons.</p><p className="mt-10 text-[9px] uppercase tracking-[0.25em] text-primary">Espaço Imperial</p></article>;
}

function ProductModal({ selection, onClose }: { selection: { item: MenuItem; category: Category }; onClose: () => void }) {
  const startY = useRef<number | null>(null);
  const { item, category } = selection;
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="product-name" className="modal-sheet relative max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain scroll-smooth rounded-t-2xl border border-border bg-card shadow-modal sm:rounded-lg" onTouchStart={(event) => { startY.current = event.touches[0]?.clientY ?? null; }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientY; if (startY.current !== null && end !== undefined && end - startY.current > 90) onClose(); startY.current = null; }}>
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted sm:hidden" />
        <Button aria-label="Fechar detalhes" title="Fechar" variant="outline" size="icon" onClick={onClose} className="absolute right-3 top-3 z-10 size-11 rounded-full bg-background/85 backdrop-blur"><X className="size-4" /></Button>
        <div className="relative aspect-[16/10] overflow-hidden sm:rounded-t-lg"><img src={item.imageUrl || images[category.id] || artesanaisImage} alt={item.name} width={1200} height={800} loading="eager" decoding="async" className="h-full w-full object-cover" /><div className="image-shade-soft absolute inset-0" /><p className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.25em] text-primary">{category.title}</p></div>
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

function SearchModal({ onClose, onSelect }: { onClose: () => void; onSelect: (item: MenuItem, category: Category) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery.length >= 2 ? menu.flatMap(cat => 
    cat.items
      .filter(item => 
        item.name.toLowerCase().includes(normalizedQuery) || 
        item.desc.toLowerCase().includes(normalizedQuery) ||
        cat.title.toLowerCase().includes(normalizedQuery)
      )
      .map(item => ({ item, category: cat }))
  ) : [];

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur sm:p-6 sm:items-center sm:justify-center" role="presentation">
      <div className="flex w-full max-w-lg flex-col h-full sm:h-[80vh] sm:border sm:border-border sm:rounded-xl sm:overflow-hidden sm:shadow-modal bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4 bg-card shrink-0">
          <Search className="size-5 text-muted-foreground" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Buscar produtos, categorias..." 
            className="flex-1 bg-transparent outline-none text-foreground text-base sm:text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}><X className="size-5" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-card">
          {results.length > 0 ? (
            <div className="flex flex-col gap-2">
              {results.map(({ item, category }) => (
                <button 
                  key={item.id} 
                  className="flex flex-col border border-border/50 bg-secondary/30 rounded-lg p-3 text-left hover:bg-secondary/60 transition-colors focus:outline-none focus:ring-1 focus:ring-primary" 
                  onClick={() => onSelect(item, category)}
                >
                  <p className="text-[10px] uppercase tracking-wider text-primary mb-1">{category.title}</p>
                  <div className="flex justify-between items-start gap-3 w-full">
                    <div className="min-w-0">
                      <p className="font-display text-base text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-gold-dark shrink-0">
                      {item.price !== null ? money(item.price) : "Consulte"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : normalizedQuery.length >= 2 ? (
            <p className="text-center text-sm text-muted-foreground mt-10">Nenhum produto encontrado para "{query}".</p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6 gap-3">
              <Search className="size-8 opacity-20" />
              <p className="text-sm">Digite pelo menos 2 letras para buscar produtos, bebidas ou sobremesas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
