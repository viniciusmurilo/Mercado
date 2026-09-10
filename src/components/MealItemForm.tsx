import { useState } from "react";
import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { CATEGORIES, UNITS } from "../data/categories";

interface MealItemFormProps {
  onAdd: (input: { name: string; quantity: number; unit: string; category: string }) => void;
}

export function MealItemForm({ onAdd }: MealItemFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState("g");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedQuantity = Number(quantity.replace(",", "."));

    if (!trimmedName) {
      setError("Informe o alimento.");
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantidade inválida.");
      return;
    }

    onAdd({ name: trimmedName, quantity: parsedQuantity, unit, category });
    setName("");
    setQuantity("100");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3">
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-[11px] font-medium text-slate-500">Alimento</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Peito de frango"
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div className="w-20">
        <label className="mb-1 block text-[11px] font-medium text-slate-500">Qtd.</label>
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          inputMode="decimal"
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div className="w-20">
        <label className="mb-1 block text-[11px] font-medium text-slate-500">Un.</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div className="w-36">
        <label className="mb-1 block text-[11px] font-medium text-slate-500">Categoria</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
      >
        <Plus size={14} /> Adicionar
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
