import { useState } from "react";
import { Sidebar, type View } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { DashboardPage } from "./pages/DashboardPage";
import { DietPlansPage } from "./pages/DietPlansPage";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDietPlans } from "./hooks/useDietPlans";
import { createId } from "./utils/id";
import type { ShoppingItem, ShoppingItemInput } from "./types";

export default function App() {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>("mercado.items", []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<View>("dashboard");

  const dietPlans = useDietPlans();

  function handleAdd(input: ShoppingItemInput) {
    setItems((prev) => [...prev, { id: createId(), checked: false, createdAt: Date.now(), ...input }]);
  }

  function handleQuickAdd(input: ShoppingItemInput) {
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

  function handleGenerateList(inputs: ShoppingItemInput[]) {
    setItems((prev) => {
      let next = [...prev];
      for (const input of inputs) {
        const existing = next.find(
          (item) =>
            !item.checked &&
            item.category === input.category &&
            item.unit === input.unit &&
            item.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
        );
        if (existing) {
          next = next.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: Math.round((item.quantity + input.quantity) * 100) / 100 }
              : item,
          );
        } else {
          next = [...next, { id: createId(), checked: false, createdAt: Date.now(), ...input }];
        }
      }
      return next;
    });
    setView("dashboard");
  }

  function handleToggle(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeView={view} onNavigate={setView} />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} activeView={view} />

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 sm:p-6">
          {view === "dashboard" ? (
            <DashboardPage
              items={items}
              onAdd={handleAdd}
              onQuickAdd={handleQuickAdd}
              onToggle={handleToggle}
              onRemove={handleRemove}
              onChangeQuantity={handleChangeQuantity}
              onClearChecked={handleClearChecked}
            />
          ) : (
            <DietPlansPage
              patients={dietPlans.patients}
              menus={dietPlans.menus}
              mealItems={dietPlans.mealItems}
              foods={dietPlans.foods}
              onAddPatient={dietPlans.addPatient}
              onRemovePatient={dietPlans.removePatient}
              onAddMenu={dietPlans.addMenu}
              onRemoveMenu={dietPlans.removeMenu}
              onRenameMenu={dietPlans.renameMenu}
              onDuplicateMenu={dietPlans.duplicateMenu}
              onAddMealItem={dietPlans.addMealItem}
              onRemoveMealItem={dietPlans.removeMealItem}
              onChangeMealItemQuantity={dietPlans.changeMealItemQuantity}
              onGenerateList={handleGenerateList}
            />
          )}
        </main>
      </div>
    </div>
  );
}
