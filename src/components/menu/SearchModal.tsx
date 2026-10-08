import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Category, MenuItem } from "@/types/menu";
import { itemImage } from "@/components/menu/images";
import { ItemPrices } from "@/components/menu/ItemPrices";
import { Button } from "@/components/ui/button";

type SearchResult = { item: MenuItem; category: Category };

export function SearchModal({
  menu,
  onClose,
  onSelect,
}: {
  menu: Category[];
  onClose: () => void;
  onSelect: (item: MenuItem, category: Category) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-foca o input ao abrir
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fecha com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results: SearchResult[] = query.trim().length >= 2
    ? menu.flatMap((category) =>
        category.items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.desc.toLowerCase().includes(query.toLowerCase()),
          )
          .map((item) => ({ item, category })),
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" role="presentation">
      {/* Barra de busca */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Buscar no cardápio…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Fechar busca"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Área de resultados */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-background">
        {query.trim().length < 2 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center text-muted-foreground">
            <Search className="size-10 opacity-15" />
            <p className="text-sm">Digite pelo menos 2 letras para buscar</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center text-muted-foreground">
            <p className="text-sm">
              Nenhum item encontrado para{" "}
              <strong className="text-foreground">&ldquo;{query}&rdquo;</strong>
            </p>
          </div>
        ) : (
          <ul className="mx-auto max-w-lg divide-y divide-border pb-8">
            {results.map(({ item, category }) => {
              const thumbnail = itemImage(item, category.id);
              return (
                <li key={`${category.id}-${item.id}`}>
                   <Button
                    type="button"
                     variant="ghost"
                    onClick={() => {
                      onSelect(item, category);
                      onClose();
                    }}
                     className="flex h-auto w-full items-center gap-3 rounded-none px-4 py-3 text-left transition-colors hover:bg-accent sm:px-6"
                  >
                    <img
                      src={thumbnail}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="size-14 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-[0.22em] text-primary">
                        {category.navLabel}
                      </p>
                       <p className="font-display text-base leading-tight text-foreground">
                        {item.name}
                      </p>
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">
                        {item.desc}
                      </p>
                       {item.serves && <p className="mt-1 text-[11px] text-muted-foreground">Serve {item.serves}</p>}
                       {item.options.length > 0 && <ItemPrices item={item} />}
                    </div>
                     {item.options.length === 0 && <span className="shrink-0"><ItemPrices item={item} /></span>}
                   </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
