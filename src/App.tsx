import { useMemo, useState } from "react";
import { CheckCircle2, ListTodo, PackageSearch, Percent } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { StatCard } from "./components/StatCard";
import { AddItemForm } from "./components/AddItemForm";
import { QuickAddPanel } from "./components/QuickAddPanel";
import { ShoppingListTable } from "./components/ShoppingListTable";
import { ExportActions } from "./components/ExportActions";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { ShoppingItem } from "./types";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>("mercado.items", []);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useMemo(() => {
    const pending = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);
    const categories = new Set(items.map((i) => i.category));
    const progress = items.length === 0 ? 0 : Math.round((checked.length / items.length) * 100);
    return { pending, checked, categories: categories.size, progress };
  }, [items]);

  function handleAdd(input: { name: string; quantity: number; unit: string; category: string }) {
    setItems((prev) => [
      ...prev,
      { id: createId(), checked: false, createdAt: Date.now(), ...input },
    ]);
  }

  function handleQuickAdd(input: { name: string; quantity: number; unit: string; category: string }) {
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          !item.checked &&
          item.category === input.category &&
          item.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
      );
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + input.quantity } : item,
        );
      }
      return [...prev, { id: createId(), checked: false, createdAt: Date.now(), ...input }];
    });
  }

  function handleToggle(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleChangeQuantity(id: string, delta: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.round((item.quantity + delta) * 100) / 100) }
          : item,
      ),
    );
  }

  function handleClearChecked() {
    setItems((prev) => prev.filter((item) => !item.checked));
  }

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.checked) - Number(b.checked) || a.createdAt - b.createdAt),
    [items],
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Itens na lista" value={items.length} icon={PackageSearch} accent="#2563eb" />
            <StatCard label="Faltando comprar" value={stats.pending.length} icon={ListTodo} accent="#d97706" />
            <StatCard label="No carrinho" value={stats.checked.length} icon={CheckCircle2} accent="#16a34a" />
            <StatCard label="Progresso" value={`${stats.progress}%`} icon={Percent} accent="#7c3aed" />
          </div>

          <QuickAddPanel items={sortedItems} onQuickAdd={handleQuickAdd} />

          <AddItemForm onAdd={handleAdd} />

          <ExportActions
            items={sortedItems}
            onClearChecked={handleClearChecked}
            hasChecked={stats.checked.length > 0}
          />

          <ShoppingListTable
            items={sortedItems}
            onToggle={handleToggle}
            onRemove={handleRemove}
            onChangeQuantity={handleChangeQuantity}
          />
        </main>
      </div>
    </div>
  );
}
