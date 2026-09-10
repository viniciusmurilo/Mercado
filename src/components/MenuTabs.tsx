import { Plus, X } from "lucide-react";
import type { Menu } from "../types";
import { MAX_MENUS_PER_PATIENT } from "../data/meals";

interface MenuTabsProps {
  menus: Menu[];
  activeMenuId: string | undefined;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function MenuTabs({ menus, activeMenuId, onSelect, onAdd, onRemove }: MenuTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {menus.map((menu) => (
        <div key={menu.id} className="group relative">
          <button
            type="button"
            onClick={() => onSelect(menu.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeMenuId === menu.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {menu.name}
          </button>
          {menus.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(menu.id)}
              className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white hover:bg-red-500 group-hover:flex"
              aria-label={`Remover ${menu.name}`}
            >
              <X size={9} />
            </button>
          )}
        </div>
      ))}
      {menus.length < MAX_MENUS_PER_PATIENT && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
        >
          <Plus size={12} /> Cardápio
        </button>
      )}
    </div>
  );
}
