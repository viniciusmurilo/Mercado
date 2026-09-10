import { useLocalStorage } from "./useLocalStorage";
import { createId } from "../utils/id";
import { DEFAULT_PATIENTS } from "../data/patients";
import { MAX_MENUS_PER_PATIENT } from "../data/meals";
import type { MealId, MealItem, Menu, Patient } from "../types";

export interface MealItemInput {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

const DEFAULT_MENUS: Menu[] = DEFAULT_PATIENTS.map((p) => ({
  id: `${p.id}-menu-1`,
  patientId: p.id,
  name: "Cardápio 1",
}));

export function useDietPlans() {
  const [patients, setPatients] = useLocalStorage<Patient[]>("mercado.patients", DEFAULT_PATIENTS);
  const [menus, setMenus] = useLocalStorage<Menu[]>("mercado.menus", DEFAULT_MENUS);
  const [mealItems, setMealItems] = useLocalStorage<MealItem[]>("mercado.mealItems", []);

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

  function addMealItem(menuId: string, meal: MealId, input: MealItemInput) {
    setMealItems((prev) => [...prev, { id: createId(), menuId, meal, ...input }]);
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
    addPatient,
    removePatient,
    addMenu,
    removeMenu,
    addMealItem,
    removeMealItem,
    changeMealItemQuantity,
  };
}
