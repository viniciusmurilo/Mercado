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

export type Preparation = "cru" | "pronto";

export interface MealItem {
  id: string;
  menuId: string;
  meal: MealId;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  /** Se a quantidade registrada é como comprado (cru) ou como consumido (pronto). */
  preparation: Preparation;
  /** Fator de cocção (peso pronto / peso cru) usado para converter para peso de compra quando preparation === "pronto". */
  factor: number;
}

export type MealItemInput = Omit<MealItem, "id" | "menuId" | "meal">;

/**
 * Catálogo de alimentos reutilizável no cadastro dos planos alimentares.
 * O fator de cocção pertence ao alimento (não a cada lançamento): ao
 * adicionar um item de refeição, o catálogo é atualizado com o
 * nome/unidade/categoria/fator usados, então o próximo lançamento do
 * mesmo alimento já vem com esses valores por padrão.
 */
export interface Food {
  id: string;
  name: string;
  unit: string;
  category: string;
  factor: number;
}

export type ShoppingItemInput = Omit<ShoppingItem, "id" | "checked" | "createdAt">;
