import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { CATEGORIES } from "../data/categories";
import { COMMON_ITEMS } from "../data/commonItems";
import type { ShoppingItem } from "../types";

interface QuickAddPanelProps {
  items: ShoppingItem[];
  onQuickAdd: (input: { name: string; quantity: number; unit: string; category: string }) => void;
}

const AVAILABLE_CATEGORIES = CATEGORIES.filter((c) =>
  COMMON_ITEMS.some((item) => item.category === c.id),
);

export function QuickAddPanel({ items, onQuickAdd }: QuickAddPanelProps) {
  const [activeCategory, setActiveCategory] = useState(AVAILABLE_CATEGORIES[0].id);
  const [search, setSearch] = useState("");

  const quantityInList = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (item.checked) continue;
      const key = `${item.name.trim().toLowerCase()}|${item.category}`;
      map.set(key, (map.get(key) ?? 0) + item.quantity);
    }
    return map;
  }, [items]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query) {
      return COMMON_ITEMS.filter((item) => item.name.toLowerCase().includes(query));
    }
    return COMMON_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory, search]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Itens comuns de mercado</h2>
        <div className="relative sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar item..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {!search && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {AVAILABLE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === category.id
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={activeCategory === category.id ? { backgroundColor: category.color } : undefined}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">Nenhum item encontrado.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visibleItems.map((item) => {
            const key = `${item.name.trim().toLowerCase()}|${item.category}`;
            const inList = quantityInList.get(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onQuickAdd({ name: item.name, quantity: 1, unit: item.unit, category: item.category })}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  inList
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                {inList ? <Check size={13} /> : <Plus size={13} />}
                {item.name}
                {inList ? ` · ${inList} ${item.unit}` : ""}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
