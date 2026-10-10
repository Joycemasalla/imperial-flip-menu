import { Users, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { MenuItem, Category } from "@/types/menu";
import { itemImage } from "@/components/menu/images";

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ProductModal({
  selection,
  onClose,
}: {
  selection: { item: MenuItem; category: Category };
  onClose: () => void;
}) {
  const startY = useRef<number | null>(null);
  const { item, category } = selection;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-name"
        className="modal-sheet relative max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain scroll-smooth rounded-t-2xl border border-border bg-card shadow-modal sm:rounded-lg"
        onTouchStart={(event) => {
          startY.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(event) => {
          const end = event.changedTouches[0]?.clientY;
          if (startY.current !== null && end !== undefined && end - startY.current > 90) onClose();
          startY.current = null;
        }}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted sm:hidden" />
        <Button
          aria-label="Fechar detalhes"
          title="Fechar"
          variant="outline"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 size-11 rounded-full bg-background/85 backdrop-blur"
        >
          <X className="size-4" />
        </Button>

        {category.id !== "refeicoes" && (
          <div className="relative aspect-[16/10] overflow-hidden sm:rounded-t-lg">
            <img
              src={itemImage(item, category.id)}
              alt={item.name}
              width={1200}
              height={800}
              loading="eager"
              decoding="async"
              className="h-full w-full bg-muted object-cover"
            />
            <div className="image-shade-soft absolute inset-0" />
            <p className="absolute bottom-4 left-5 text-[10px] uppercase tracking-[0.25em] text-primary">
              {category.title}
            </p>
            {(category.id === "drinks" ||
              [
                "mineirinho",
                "brownie",
                "brownie-com-sorvete",
                "contra-file",
                "contra-file-c-fritas",
                "contra-file-ou-alcatra",
                "churrasco-misto",
              ].includes(item.id) ||
              item.imageUrl?.includes("_real.jpg")) && (
              <p className="absolute bottom-4 right-4 rounded-md bg-black/60 px-2.5 py-1 text-[9px] uppercase tracking-wider text-white/90 backdrop-blur-md">
                Imagem Ilustrativa
              </p>
            )}
          </div>
        )}

        <div className={`p-5 sm:p-7 ${category.id === "refeicoes" ? "pt-12 sm:pt-14" : ""}`}>
          <h2 id="product-name" className="font-display text-3xl text-card-foreground sm:text-4xl">
            {item.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>

          {item.serves && (
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
              <Users className="size-4" />
              <span>Serve {item.serves}</span>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            {item.options.length > 0 ? (
              <div className="space-y-2">
                {item.options.map((option) => (
                   <div key={option.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                     <span className="text-sm text-muted-foreground">{option.label}</span>
                     <strong className="whitespace-nowrap font-display text-xl tabular-nums text-primary">{money(option.price)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Valor</span>
                <strong className="font-display text-3xl text-primary">
                  {item.price !== null ? money(item.price) : "Consulte"}
                </strong>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Chame o garçom para fazer seu pedido
          </p>
        </div>
      </section>
    </div>
  );
}
