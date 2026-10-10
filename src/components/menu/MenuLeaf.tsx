import type { UIEvent as ReactUIEvent } from "react";
import type { MenuItem, Category } from "@/types/menu";
import { categoryImage, itemImage } from "@/components/menu/images";
import { ItemPrices } from "@/components/menu/ItemPrices";
import { Button } from "@/components/ui/button";

function MenuItemRow({
  item,
  categoryId,
  onSelect,
}: {
  item: MenuItem;
  categoryId: string;
  onSelect: (item: MenuItem) => void;
}) {
  const thumbnail = itemImage(item, categoryId);
  const showImage = categoryId !== "refeicoes";

  const isStandardPizza = 
    (categoryId === "pizzas" || categoryId === "pizzas-doces") && 
    item.options.length === 3;

  return (
    <Button
      type="button"
      variant="ghost"
      data-menu-item={item.id}
      data-category={categoryId}
      onClick={() => onSelect(item)}
      className={`menu-item group grid h-auto min-h-20 w-full items-center gap-3 rounded-none border-b border-ink/10 px-0 py-2.5 text-left hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
        showImage 
          ? "grid-cols-[4rem_minmax(0,1fr)] sm:grid-cols-[4.5rem_minmax(0,1fr)]"
          : "grid-cols-1 py-4"
      }`}
    >
      {showImage && (
        <img
          src={thumbnail}
          alt=""
          width={144}
          height={144}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-16 shrink-0 rounded-md bg-muted object-cover sm:size-18"
        />
      )}
      <div className="min-w-0">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <h2 className="line-clamp-2 font-display text-base leading-tight text-paper-foreground sm:text-lg">
              {item.name}
            </h2>
            {item.highlight && (
              <span className="mt-0.5 block text-[8px] uppercase tracking-[0.15em] text-gold-dark">
                Destaque
              </span>
            )}
          </div>
          {item.options.length === 0 && <span className="max-w-24 text-right sm:max-w-28"><ItemPrices item={item} paper /></span>}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-paper-foreground/80 sm:text-xs">
          {item.desc}
        </p>
        {item.serves && <p className="mt-1 text-[11px] text-paper-foreground/80">Serve {item.serves}</p>}
        {item.options.length > 0 && !isStandardPizza && <ItemPrices item={item} paper />}
      </div>
    </Button>
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

export function MenuLeaf({
  category,
  number,
  eager,
  onSelect,
}: {
  category: Category;
  number: number;
  eager: boolean;
  onSelect: (item: MenuItem) => void;
}) {
  const image = categoryImage(category.id);

  return (
    <article className="book-page menu-leaf relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48 lg:h-52">
        <img
          src={image}
          alt={`Seleção de ${category.title}`}
          width={1200}
          height={800}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={number === 1 ? "high" : "auto"}
          style={{ objectPosition: "right center" }}
          className="h-full w-full bg-muted object-cover"
        />
        <div className="image-shade absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 pb-3 sm:px-7 sm:pb-4">
          <div className="min-w-0">
            <p className="mb-1.5 text-[9px] uppercase tracking-[0.3em] text-primary">Seleção imperial</p>
            <h1 className="font-display text-xl leading-tight text-foreground sm:text-3xl">{category.title}</h1>
          </div>
          <p className="shrink-0 pb-1 text-[10px] uppercase tracking-[0.18em] text-foreground/75">
            {category.items.length} opções
          </p>
        </div>
      </div>
      <div className="menu-scroll-wrap relative min-h-0 flex-1">
        <div
          ref={updateScrollHint}
          onScroll={trackScrollHint}
          className="menu-scroll-area h-full overflow-y-auto px-4 pb-16 pt-3 sm:px-6 sm:pb-14 sm:pt-4"
        >
          {category.subtitle && (
            <p className="mb-3 border-l border-primary pl-3 text-[11px] leading-relaxed text-paper-foreground/80">
              {category.subtitle}
            </p>
          )}
          {category.id === "drinks" && (
            <p className="mb-4 inline-flex items-center rounded-md bg-gold-dark/10 px-2.5 py-1 text-[9px] uppercase tracking-wider text-gold-dark">
              * As fotos desta seção são ilustrativas
            </p>
          )}
          <div className="grid grid-cols-1 gap-x-6">
            {category.items.map((item) => (
              <MenuItemRow key={item.id} item={item} categoryId={category.id} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-ink/10 px-5 py-2 text-[9px] uppercase tracking-[0.18em] text-paper-muted">
        <span>Toque para ver detalhes</span>
        <span>{String(number).padStart(2, "0")}</span>
      </div>
    </article>
  );
}
