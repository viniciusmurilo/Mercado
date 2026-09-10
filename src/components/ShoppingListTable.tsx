import { Minus, Plus, Trash2 } from "lucide-react";
import type { ShoppingItem } from "../types";
import { CategoryBadge } from "./CategoryBadge";

interface ShoppingListTableProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onChangeQuantity: (id: string, delta: number) => void;
}

export function ShoppingListTable({
  items,
  onToggle,
  onRemove,
  onChangeQuantity,
}: ShoppingListTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          Sua lista está vazia. Adicione o que está faltando acima.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap ${
              item.checked ? "bg-slate-50" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-medium ${
                  item.checked ? "text-slate-400 line-through" : "text-slate-900"
                }`}
              >
                {item.name}
              </p>
              <div className="mt-1">
                <CategoryBadge categoryId={item.category} />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChangeQuantity(item.id, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                aria-label="Diminuir quantidade"
              >
                <Minus size={14} />
              </button>
              <span className="w-16 text-center text-sm font-medium text-slate-700">
                {item.quantity} {item.unit}
              </span>
              <button
                type="button"
                onClick={() => onChangeQuantity(item.id, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                aria-label="Aumentar quantidade"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Remover item"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
