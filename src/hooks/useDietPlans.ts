import { useLocalStorage } from "./useLocalStorage";
import { createId } from "../utils/id";
import { DEFAULT_PATIENTS } from "../data/patients";
import { MAX_MENUS_PER_PATIENT } from "../data/meals";
import { DEFAULT_FOODS } from "../data/foods";
import type { Food, MealId, MealItem, MealItemInput, Menu, Patient } from "../types";

const DEFAULT_MENUS: Menu[] = DEFAULT_PATIENTS.map((p) => ({
  id: `${p.id}-menu-1`,
  patientId: p.id,
  name: "Cardápio 1",
}));

export function useDietPlans() {
  const [patients, setPatients] = useLocalStorage<Patient[]>("mercado.patients", DEFAULT_PATIENTS);
  const [menus, setMenus] = useLocalStorage<Menu[]>("mercado.menus", DEFAULT_MENUS);
  const [mealItems, setMealItems] = useLocalStorage<MealItem[]>("mercado.mealItems", []);
  const [foods, setFoods] = useLocalStorage<Food[]>("mercado.foods", DEFAULT_FOODS);

  /**
   * Atualiza o catálogo de alimentos com o unidade/categoria usados e,
   * quando informado, o fator de cocção — mantendo o fator já cadastrado
   * quando o lançamento não define um (ex: item marcado como "cru").
   */
  function upsertFood(input: { name: string; unit: string; category: string; factor?: number }) {
    const normalized = input.name.trim().toLowerCase();
    setFoods((prev) => {
      const existingIndex = prev.findIndex((f) => f.name.trim().toLowerCase() === normalized);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          unit: input.unit,
          category: input.category,
          ...(input.factor !== undefined ? { factor: input.factor } : {}),
        };
        return next;
      }
      return [
        ...prev,
        { id: createId(), name: input.name.trim(), unit: input.unit, category: input.category, factor: input.factor ?? 1 },
      ];
    });
  }

  function addPatient(name: string) {
    const patientId = createId();
    setPatients((prev) => [...prev, { id: patientId, name }]);
    setMenus((prev) => [...prev, { id: createId(), patientId, name: "Cardápio 1" }]);
  }

  function removePatient(patientId: string) {
    const menuIds = new Set(menus.filter((m) => m.patientId === patientId).map((m) => m.id));
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setMenus((prev) => prev.filter((m) => m.patientId !== patientId));
    setMealItems((prev) => prev.filter((mi) => !menuIds.has(mi.menuId)));
  }

  function addMenu(patientId: string) {
    setMenus((prev) => {
      const count = prev.filter((m) => m.patientId === patientId).length;
      if (count >= MAX_MENUS_PER_PATIENT) return prev;
      return [...prev, { id: createId(), patientId, name: `Cardápio ${count + 1}` }];
    });
  }

  function removeMenu(menuId: string) {
    setMenus((prev) => prev.filter((m) => m.id !== menuId));
    setMealItems((prev) => prev.filter((mi) => mi.menuId !== menuId));
  }

  /** Duplica um cardápio inteiro (todas as refeições/alimentos) para o mesmo paciente. */
  function duplicateMenu(menuId: string): string | undefined {
    const source = menus.find((m) => m.id === menuId);
    if (!source) return undefined;
    const siblingCount = menus.filter((m) => m.patientId === source.patientId).length;
    if (siblingCount >= MAX_MENUS_PER_PATIENT) return undefined;

    const newMenuId = createId();
    setMenus((prev) => [...prev, { id: newMenuId, patientId: source.patientId, name: `${source.name} (cópia)` }]);
    setMealItems((prev) => [
      ...prev,
      ...prev.filter((mi) => mi.menuId === menuId).map((mi) => ({ ...mi, id: createId(), menuId: newMenuId })),
    ]);
    return newMenuId;
  }

  function renameMenu(menuId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setMenus((prev) => prev.map((m) => (m.id === menuId ? { ...m, name: trimmed } : m)));
  }

  function addMealItem(menuId: string, meal: MealId, input: MealItemInput) {
    setMealItems((prev) => [...prev, { id: createId(), menuId, meal, ...input }]);
    upsertFood({
      name: input.name,
      unit: input.unit,
      category: input.category,
      factor: input.preparation === "pronto" ? input.factor : undefined,
    });
  }

  function removeMealItem(id: string) {
    setMealItems((prev) => prev.filter((mi) => mi.id !== id));
  }

  function changeMealItemQuantity(id: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    setMealItems((prev) => prev.map((mi) => (mi.id === id ? { ...mi, quantity } : mi)));
  }

  return {
    patients,
    menus,
    mealItems,
    foods,
    addPatient,
    removePatient,
    addMenu,
    removeMenu,
    renameMenu,
    duplicateMenu,
    addMealItem,
    removeMealItem,
    changeMealItemQuantity,
  };
}
