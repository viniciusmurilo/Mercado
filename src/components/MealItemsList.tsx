import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { MealItem } from "../types";
import { CategoryBadge } from "./CategoryBadge";

interface MealItemsListProps {
  items: MealItem[];
  onRemove: (id: string) => void;
  onChangeQuantity: (id: string, quantity: number) => void;
}

export function MealItemsList({ items, onRemove, onChangeQuantity }: MealItemsListProps) {
  if (items.length === 0) {
    return <p className="py-2 text-xs text-slate-400">Nenhum alimento cadastrado nessa refeição.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <MealItemRow key={item.id} item={item} onRemove={onRemove} onChangeQuantity={onChangeQuantity} />
      ))}
    </ul>
  );
}

function MealItemRow({
  item,
  onRemove,
  onChangeQuantity,
}: {
  item: MealItem;
  onRemove: (id: string) => void;
  onChangeQuantity: (id: string, quantity: number) => void;
}) {
  const [value, setValue] = useState(String(item.quantity));

  function commit() {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed) && parsed > 0) {
      onChangeQuantity(item.id, Math.round(parsed * 100) / 100);
    } else {
      setValue(String(item.quantity));
    }
  }

  const factor = item.factor && item.factor > 0 ? item.factor : 1;
  const purchaseQuantity = Math.round((item.quantity / factor) * 100) / 100;

  return (
    <li className="flex flex-wrap items-center gap-2 py-2 text-sm">
      <span className="min-w-0 flex-1 truncate text-slate-800">{item.name}</span>
      <CategoryBadge categoryId={item.category} />
      {item.preparation === "pronto" && (
        <span
          className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700"
          title={`${item.quantity}${item.unit} pronto ÷ ${factor} ≈ ${purchaseQuantity}${item.unit} cru para comprar`}
        >
          Pronto → {purchaseQuantity}
          {item.unit} cru
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="w-16 rounded-md border border-slate-300 px-1.5 py-1 text-right text-sm outline-none focus:border-emerald-500"
      />
      <span className="w-8 text-xs text-slate-500">{item.unit}</span>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500"
        aria-label="Remover alimento"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}
