export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  createdAt: number;
}

export interface Patient {
  id: string;
  name: string;
}

export type MealId = "cafe" | "almoco" | "cafe_tarde" | "janta";

export interface Menu {
  id: string;
  patientId: string;
  name: string;
}

export interface MealItem {
  id: string;
  menuId: string;
  meal: MealId;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}
