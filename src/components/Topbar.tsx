import { Menu, ShoppingBasket } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
            Lista de Compras
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            O que está faltando em casa?
          </p>
        </div>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <ShoppingBasket size={18} />
      </div>
    </header>
  );
}
