import type { MealDef } from "../data/meals";
import type { Food, MealItem, MealItemInput } from "../types";
import { MealItemForm } from "./MealItemForm";
import { MealItemsList } from "./MealItemsList";

interface MealSectionProps {
  meal: MealDef;
  items: MealItem[];
  foods: Food[];
  onAdd: (input: MealItemInput) => void;
  onRemove: (id: string) => void;
  onChangeQuantity: (id: string, quantity: number) => void;
}

export function MealSection({ meal, items, foods, onAdd, onRemove, onChangeQuantity }: MealSectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{meal.label}</h3>
      <MealItemForm foods={foods} onAdd={onAdd} />
      <div className="mt-2">
        <MealItemsList items={items} onRemove={onRemove} onChangeQuantity={onChangeQuantity} />
      </div>
    </div>
  );
}
