import type { MealId } from "../types";

export interface MealDef {
  id: MealId;
  label: string;
}

export const MEALS: MealDef[] = [
  { id: "cafe", label: "Café da manhã" },
  { id: "almoco", label: "Almoço" },
  { id: "cafe_tarde", label: "Café da tarde" },
  { id: "janta", label: "Jantar" },
];

export function mealLabel(id: MealId): string {
  return MEALS.find((m) => m.id === id)?.label ?? id;
}

export const MAX_MENUS_PER_PATIENT = 10;

export const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
