import type { Food } from "../types";
import { COMMON_ITEMS } from "./commonItems";
import { suggestCookingFactor } from "./cookingFactors";

/**
 * Catálogo inicial de alimentos, reaproveitando a mesma lista de itens
 * comuns usada no painel de adição rápida da lista de compras, já com
 * o fator de cocção sugerido (1 = sem alteração de peso ao preparar).
 */
export const DEFAULT_FOODS: Food[] = COMMON_ITEMS.map((item, index) => ({
  id: `food-${index}`,
  name: item.name,
  unit: item.unit,
  category: item.category,
  factor: suggestCookingFactor(item.name) ?? 1,
}));
