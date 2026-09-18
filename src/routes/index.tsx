import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Crown, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import artesanaisImage from "@/assets/artesanais.jpg";
import bagueteImage from "@/assets/baguete.jpg";
import bebidasImage from "@/assets/bebidas.jpg";
import chapasImage from "@/assets/chapas.jpg";
import docesImage from "@/assets/doces.jpg";
import picanhaImage from "@/assets/picanha.jpg";
import pizzasImage from "@/assets/pizzas.jpg";
import porcoesImage from "@/assets/porcoes.jpg";
import tradicionaisImage from "@/assets/tradicionais.jpg";
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
  serves?: string;
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
const PAGE_SIZE = 7;
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
  const [turn, setTurn] = useState<"next" | "prev" | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const active = pages[page];
  const rightPage = pages[page + 1];

  const go = (next: number) => {
    const target = Math.max(0, Math.min(pages.length - 1, next));
    if (target === page) return;
    setTurn(target > page ? "next" : "prev");
    setPage(target);
    window.setTimeout(() => setTurn(null), 360);
  };

  const goCategory = (id: string) => {
    const target = pages.findIndex((entry) => entry.category.id === id);
    if (target >= 0) go(target);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selected && event.key === "Escape") setSelected(null);
      else if (!selected && event.key === "ArrowRight") go(page + 1);
      else if (!selected && event.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, selected]);

  if (!active) return null;

  return (
    <main className="menu-shell min-h-dvh overflow-hidden bg-background text-foreground">
      <header className="brand-header grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="brand-seal grid size-10 shrink-0 place-items-center rounded-full border border-primary/60 text-primary">
            <Crown className="size-4" aria-hidden="true" />
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
              variant={active.category.id === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => goCategory(category.id)}
              className={cn("rounded-full px-4", active.category.id === category.id && "shadow-gold")}
            >
              {category.id === "pizzas-doces" ? "Doces" : category.navLabel}
            </Button>
          ))}
        </div>
      </nav>

      <section
        className="book-stage relative mx-auto flex w-full max-w-6xl items-center px-2 py-3 sm:px-12 sm:py-5"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const touch = event.changedTouches[0];
          touchStart.current = null;
          if (!start || !touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(page + (dx < 0 ? 1 : -1));
        }}
      >
        <Button aria-label="Página anterior" title="Página anterior" variant="ghost" size="icon" onClick={() => go(page - 1)} disabled={page === 0} className="book-arrow absolute left-2 z-20 hidden rounded-full sm:inline-flex">
          <ChevronLeft className="size-5" />
        </Button>

        <div className={cn("book relative mx-auto grid w-full overflow-hidden", turn && `turn-${turn}`)}>
          <MenuLeaf page={active} number={page + 1} onSelect={(item) => setSelected({ item, category: active.category })} />
          <div className="book-gutter hidden lg:block" aria-hidden="true" />
          <div className="hidden lg:block">
            {rightPage ? (
              <MenuLeaf page={rightPage} number={page + 2} onSelect={(item) => setSelected({ item, category: rightPage.category })} right />
            ) : <ClosingLeaf />}
          </div>
        </div>

        <Button aria-label="Próxima página" title="Próxima página" variant="ghost" size="icon" onClick={() => go(page + 1)} disabled={page === pages.length - 1} className="book-arrow absolute right-2 z-20 hidden rounded-full sm:inline-flex">
          <ChevronRight className="size-5" />
        </Button>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-border bg-background/95 px-4 py-2 backdrop-blur sm:hidden">
        <Button aria-label="Página anterior" variant="ghost" size="icon" onClick={() => go(page - 1)} disabled={page === 0}><ChevronLeft className="size-5" /></Button>
        <div className="min-w-0 text-center">
          <p className="truncate text-xs font-semibold text-foreground">{active.category.navLabel}</p>
          <div className="mx-auto mt-1 h-0.5 w-full max-w-36 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${((page + 1) / pages.length) * 100}%` }} /></div>
        </div>
        <Button aria-label="Próxima página" variant="ghost" size="icon" onClick={() => go(page + 1)} disabled={page === pages.length - 1}><ChevronRight className="size-5" /></Button>
      </footer>

      {selected && <ProductModal selection={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function MenuLeaf({ page, number, onSelect, right = false }: { page: MenuPage; number: number; onSelect: (item: MenuItem) => void; right?: boolean }) {
  const image = images[page.category.id] ?? artesanaisImage;
  return (
    <article className={cn("menu-leaf relative flex h-full min-h-0 flex-col overflow-hidden", right && "right-leaf")}>
      <div className="relative h-32 shrink-0 overflow-hidden sm:h-40 lg:h-44">
        <img src={image} alt={`Seleção de ${page.category.title}`} width={1200} height={800} loading={number <= 2 ? "eager" : "lazy"} className="h-full w-full object-cover" />
        <div className="image-shade absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 sm:px-7">
          <p className="mb-1 text-[9px] uppercase tracking-[0.3em] text-primary">Seleção imperial</p>
          <h1 className="font-display text-3xl leading-none text-paper-foreground sm:text-4xl">{page.category.title}</h1>
          {page.parts > 1 && <p className="mt-1 text-[10px] text-paper-muted">Parte {page.part + 1} de {page.parts}</p>}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
        {page.part === 0 && page.category.subtitle && <p className="mb-3 border-l border-primary pl-3 text-[10px] leading-relaxed text-paper-muted">{page.category.subtitle}</p>}
        <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {page.items.map((item) => <MenuItemRow key={item.id} item={item} onClick={() => onSelect(item)} />)}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-ink/10 px-5 py-2 text-[9px] uppercase tracking-[0.18em] text-paper-muted">
        <span>Toque para ver detalhes</span><span>{String(number).padStart(2, "0")}</span>
      </div>
    </article>
  );
}

function MenuItemRow({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  const basePrice = item.price !== null ? money(item.price) : item.options.length ? `a partir de ${money(Math.min(...item.options.map((option) => option.price)))}` : "Consulte";
  return (
    <button type="button" onClick={onClick} className="menu-item group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-ink/10 py-2.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2"><h2 className="truncate font-display text-base text-paper-foreground sm:text-lg">{item.name}</h2>{item.highlight && <span className="shrink-0 text-[8px] uppercase tracking-[0.15em] text-gold-dark">Destaque</span>}</div>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-paper-muted sm:text-[11px]">{item.desc}</p>
      </div>
      <span className="pt-0.5 text-xs font-bold tabular-nums text-gold-dark sm:text-sm">{basePrice}</span>
    </button>
  );
}

function ClosingLeaf() {
  return <article className="menu-leaf right-leaf flex h-full flex-col items-center justify-center p-10 text-center"><Crown className="mb-4 size-7 text-gold-dark" /><p className="font-display text-4xl text-paper-foreground">Bom apetite</p><p className="mt-3 max-w-xs text-xs leading-relaxed text-paper-muted">Quando decidir, é só chamar um de nossos garçons.</p></article>;
}

function ProductModal({ selection, onClose }: { selection: { item: MenuItem; category: Category }; onClose: () => void }) {
  const startY = useRef<number | null>(null);
  const { item, category } = selection;
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="product-name" className="modal-sheet relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card shadow-modal sm:rounded-lg" onTouchStart={(event) => { startY.current = event.touches[0]?.clientY ?? null; }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientY; if (startY.current !== null && end !== undefined && end - startY.current > 90) onClose(); startY.current = null; }}>
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted sm:hidden" />
        <Button aria-label="Fechar detalhes" title="Fechar" variant="outline" size="icon" onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-background/85 backdrop-blur"><X className="size-4" /></Button>
        <div className="relative aspect-[16/10] overflow-hidden sm:rounded-t-lg"><img src={images[category.id] ?? artesanaisImage} alt={item.name} width={1200} height={800} loading="eager" className="h-full w-full object-cover" /><div className="image-shade-soft absolute inset-0" /><p className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.25em] text-primary">{category.title}</p></div>
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
