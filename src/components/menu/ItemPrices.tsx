import type { MenuItem } from "@/types/menu";

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function ItemPrices({ item, paper = false }: { item: MenuItem; paper?: boolean }) {
  if (item.options.length === 0) {
    return <span className="text-[11px] font-bold leading-tight tabular-nums text-gold-dark sm:text-sm">{item.price !== null ? money(item.price) : "Consulte"}</span>;
  }

  return (
    <span className="mt-2 grid gap-1.5 text-[11px] leading-snug sm:text-xs">
      {item.options.map((option) => (
        <span key={option.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <span className={paper ? "text-paper-foreground/80" : "text-muted-foreground"}>{option.label}</span>
          <strong className="whitespace-nowrap tabular-nums text-gold-dark">{money(option.price)}</strong>
        </span>
      ))}
    </span>
  );
}