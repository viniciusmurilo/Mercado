import { useMemo } from "react";
import { CheckCircle2, ListTodo, PackageSearch, Percent } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { AddItemForm } from "../components/AddItemForm";
import { QuickAddPanel } from "../components/QuickAddPanel";
import { ShoppingListTable } from "../components/ShoppingListTable";
import { ExportActions } from "../components/ExportActions";
import type { ShoppingItem } from "../types";

interface DashboardPageProps {
  items: ShoppingItem[];
  onAdd: (input: { name: string; quantity: number; unit: string; category: string }) => void;
  onQuickAdd: (input: { name: string; quantity: number; unit: string; category: string }) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onChangeQuantity: (id: string, delta: number) => void;
  onClearChecked: () => void;
}

export function DashboardPage({
  items,
  onAdd,
  onQuickAdd,
  onToggle,
  onRemove,
  onChangeQuantity,
  onClearChecked,
}: DashboardPageProps) {
  const stats = useMemo(() => {
    const pending = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);
    const progress = items.length === 0 ? 0 : Math.round((checked.length / items.length) * 100);
    return { pending, checked, progress };
  }, [items]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.checked) - Number(b.checked) || a.createdAt - b.createdAt),
    [items],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Itens na lista" value={items.length} icon={PackageSearch} accent="#db2777" />
        <StatCard label="Faltando comprar" value={stats.pending.length} icon={ListTodo} accent="#d97706" />
        <StatCard label="No carrinho" value={stats.checked.length} icon={CheckCircle2} accent="#0d9488" />
        <StatCard label="Progresso" value={`${stats.progress}%`} icon={Percent} accent="#7c3aed" />
      </div>

      <QuickAddPanel items={sortedItems} onQuickAdd={onQuickAdd} />

      <AddItemForm onAdd={onAdd} />

      <ExportActions items={sortedItems} onClearChecked={onClearChecked} hasChecked={stats.checked.length > 0} />

      <ShoppingListTable
        items={sortedItems}
        onToggle={onToggle}
        onRemove={onRemove}
        onChangeQuantity={onChangeQuantity}
      />
    </div>
  );
}
