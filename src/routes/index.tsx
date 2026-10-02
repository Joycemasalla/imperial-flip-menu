import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { Button } from "@/components/ui/button";
import { CoverLeaf } from "@/components/menu/CoverLeaf";
import { ClosingLeaf } from "@/components/menu/ClosingLeaf";
import { MenuLeaf } from "@/components/menu/MenuLeaf";
import { ProductModal } from "@/components/menu/ProductModal";
import { SearchModal } from "@/components/menu/SearchModal";
import logoAsset from "@/assets/logoespaco-removebg.png";
import rawMenu from "@/data/menuData.json";
import { cn } from "@/lib/utils";
import type { Category, MenuItem, DragState } from "@/types/menu";

const menu = rawMenu as Category[];

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
  const navScrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const frameRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const active = page > 0 && page <= pages.length ? pages[page - 1] : null;
  const lastPage = pages.length + 1;

  const desktopRef = useRef(false);
  const widthRef = useRef(1);

  // Auto-scroll da barra de categorias para mostrar a categoria ativa
  useEffect(() => {
    if (!navScrollRef.current || !active) return;
    const btn = navScrollRef.current.querySelector<HTMLElement>(`[data-nav-id="${active.id}"]`);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active?.id]);

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

  const go = useCallback(
    (next: number) => {
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
      leaf.style.transform =
        direction === "next" ? "rotateY(-180deg)" : isDesktop ? "rotateY(180deg)" : "rotateY(0deg)";
      leaf.style.setProperty("--fold-shadow", "0.6");
      settleTimerRef.current = window.setTimeout(() => {
        setPage(target);
        lockedRef.current = false;
      }, 265);
    },
    [lastPage, page],
  );

  const goCategory = (id: string) => {
    const target = pages.findIndex((entry) => entry.id === id);
    if (target >= 0) go(target + 1);
  };

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (selected && event.key === "Escape") setSelected(null);
      else if (!selected && event.key === "ArrowRight") go(page + 1);
      else if (!selected && event.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page, selected]);

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
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      startedAt: performance.now(),
      axis: "pending",
      direction: null,
    };
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
      ? direction === "next"
        ? "rotateY(-180deg)"
        : isDesktop
          ? "rotateY(180deg)"
          : "rotateY(0deg)"
      : direction === "next"
        ? "rotateY(0deg)"
        : isDesktop
          ? "rotateY(0deg)"
          : "rotateY(-180deg)";
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
    return category ? (
      <MenuLeaf
        category={category}
        number={index}
        eager={eager}
        onSelect={(item) => setSelected({ item, category })}
      />
    ) : null;
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
        <div className="flex items-center gap-2">
          <Button
            aria-label="Buscar no cardápio"
            title="Buscar"
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="size-10 rounded-full"
          >
            <Search className="size-5" />
          </Button>
          <p className="hidden max-w-44 text-right text-xs leading-relaxed text-muted-foreground sm:block">
            Escolha com calma e chame o garçom para pedir.
          </p>
        </div>
      </header>

      <nav aria-label="Categorias do cardápio" className="category-rail border-y border-border bg-secondary/70 px-3 py-2 sm:px-6">
        <div ref={navScrollRef} className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {menu.map((category) => (
            <Button
              key={category.id}
              data-nav-id={category.id}
              variant={active?.id === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => goCategory(category.id)}
              className={cn("min-h-11 shrink-0 rounded-full px-4", active?.id === category.id && "shadow-gold")}
            >
              {category.id === "pizzas-doces" ? "Pizzas Doces" : category.navLabel}
            </Button>
          ))}
        </div>
      </nav>

      <section className="book-stage relative mx-auto flex w-full max-w-6xl items-center px-2 py-3 sm:px-12 sm:py-5">
        <Button
          aria-label="Página anterior"
          title="Página anterior"
          variant="ghost"
          size="icon"
          onClick={() => go(page - 1)}
          disabled={page === 0}
          className="book-arrow absolute left-2 z-20 hidden size-11 rounded-full sm:inline-flex"
        >
          <ChevronLeft className="size-5" />
        </Button>

        <div
          ref={mountRef}
          className="flipbook-mount mx-auto w-full"
          aria-label="Cardápio em formato de livro"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
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

        <Button
          aria-label="Próxima página"
          title="Próxima página"
          variant="ghost"
          size="icon"
          onClick={() => go(page + 1)}
          disabled={page === lastPage}
          className="book-arrow absolute right-2 z-20 hidden size-11 rounded-full sm:inline-flex"
        >
          <ChevronRight className="size-5" />
        </Button>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-2 border-t border-border bg-background/95 px-4 py-1.5 backdrop-blur sm:hidden">
        <Button aria-label="Página anterior" variant="ghost" size="icon" onClick={() => go(page - 1)} disabled={page === 0} className="size-9">
          <ChevronLeft className="size-4" />
        </Button>
        <div className="min-w-0 text-center">
          <p className="truncate text-[11px] font-semibold text-foreground">
            {page === 0 ? "Capa" : page === lastPage ? "Fim" : active?.navLabel}
          </p>
          <div className="mx-auto mt-1.5 h-0.5 w-full max-w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${((page + 1) / (lastPage + 1)) * 100}%` }} />
          </div>
        </div>
        <Button aria-label="Próxima página" variant="ghost" size="icon" onClick={() => go(page + 1)} disabled={page === lastPage} className="size-9">
          <ChevronRight className="size-4" />
        </Button>
      </footer>

      {selected && <ProductModal selection={selected} onClose={() => setSelected(null)} />}
      {searchOpen && (
        <SearchModal
          menu={menu}
          onClose={() => setSearchOpen(false)}
          onSelect={(item, category) => setSelected({ item, category })}
        />
      )}
    </main>
  );
}
