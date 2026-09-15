import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { CATEGORIES, UNITS } from "../data/categories";
import { suggestCookingFactor } from "../data/cookingFactors";
import type { Food, MealItemInput, Preparation } from "../types";

interface MealItemFormProps {
  foods: Food[];
  onAdd: (input: MealItemInput) => void;
}

export function MealItemForm({ foods, onAdd }: MealItemFormProps) {
  const datalistId = useId();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState("g");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [preparation, setPreparation] = useState<Preparation>("cru");
  const [factor, setFactor] = useState("1");
  const [factorTouched, setFactorTouched] = useState(false);
  const [error, setError] = useState("");

  function findFood(value: string): Food | undefined {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    return foods.find((f) => f.name.trim().toLowerCase() === normalized);
  }

  function handleNameChange(value: string) {
    setName(value);
    const match = findFood(value);
    if (match) {
      setUnit(match.unit);
      setCategory(match.category);
      if (preparation === "pronto") setFactor(String(match.factor));
      setFactorTouched(false);
    } else if (preparation === "pronto" && !factorTouched) {
      const suggestion = suggestCookingFactor(value);
      if (suggestion) setFactor(String(suggestion));
    }
  }

  function handlePreparationChange(value: Preparation) {
    setPreparation(value);
    if (value !== "pronto") return;
    const match = findFood(name);
    if (match) {
      setFactor(String(match.factor));
      setFactorTouched(false);
    } else if (!factorTouched) {
      const suggestion = suggestCookingFactor(name);
      setFactor(suggestion ? String(suggestion) : "1");
    }
  }

  function handleFactorChange(value: string) {
    setFactor(value);
    setFactorTouched(true);
  }

  const matchedFood = findFood(name);
  const parsedQuantity = Number(quantity.replace(",", "."));
  const parsedFactor = Number(factor.replace(",", "."));
  const showPurchaseHint =
    preparation === "pronto" &&
    Number.isFinite(parsedQuantity) &&
    parsedQuantity > 0 &&
    Number.isFinite(parsedFactor) &&
    parsedFactor > 0;
  const purchaseHintValue = showPurchaseHint ? Math.round((parsedQuantity / parsedFactor) * 100) / 100 : 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Informe o alimento.");
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantidade inválida.");
      return;
    }
    if (preparation === "pronto" && (!Number.isFinite(parsedFactor) || parsedFactor <= 0)) {
      setError("Fator de cocção inválido.");
      return;
    }

    onAdd({
      name: trimmedName,
      quantity: parsedQuantity,
      unit,
      category,
      preparation,
      factor: preparation === "pronto" ? parsedFactor : 1,
    });
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
          onChange={(e) => handleNameChange(e.target.value)}
          list={datalistId}
          placeholder="Ex: Peito de frango"
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        />
        <datalist id={datalistId}>
          {foods
            .filter((f) => f.category === category)
            .map((f) => (
              <option key={f.id} value={f.name} />
            ))}
        </datalist>
      </div>
      <div className="w-20">
        <label className="mb-1 block text-[11px] font-medium text-slate-500">Qtd.</label>
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          inputMode="decimal"
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        />
      </div>
      <div className="w-20">
        <label className="mb-1 block text-[11px] font-medium text-slate-500">Un.</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
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
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-medium text-slate-500">Como registrado</label>
        <div className="flex rounded-md bg-white p-0.5 text-xs ring-1 ring-slate-300">
          <button
            type="button"
            onClick={() => handlePreparationChange("cru")}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              preparation === "cru" ? "bg-pink-500 text-white" : "text-slate-500"
            }`}
          >
            Cru
          </button>
          <button
            type="button"
            onClick={() => handlePreparationChange("pronto")}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              preparation === "pronto" ? "bg-pink-500 text-white" : "text-slate-500"
            }`}
          >
            Pronto
          </button>
        </div>
      </div>

      {preparation === "pronto" && (
        <div className="w-24">
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Fator cocção</label>
          <input
            value={factor}
            onChange={(e) => handleFactorChange(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
        </div>
      )}

      <button
        type="submit"
        className="flex items-center gap-1 rounded-md bg-pink-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-600"
      >
        <Plus size={14} /> Adicionar
      </button>

      {matchedFood && (
        <p className="w-full text-[11px] text-pink-600">
          ✓ alimento já cadastrado — unidade, categoria{preparation === "pronto" ? " e fator" : ""} preenchidos
          automaticamente
        </p>
      )}
      {showPurchaseHint && (
        <p className="w-full text-[11px] text-slate-500">
          ≈ {purchaseHintValue} {unit} de {name || "alimento"} cru para comprar
        </p>
      )}
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
