export interface Category {
  id: string;
  label: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "hortifruti", label: "Hortifruti", color: "#16a34a" },
  { id: "acougue", label: "Açougue", color: "#dc2626" },
  { id: "padaria", label: "Padaria", color: "#d97706" },
  { id: "laticinios", label: "Laticínios/Frios", color: "#2563eb" },
  { id: "mercearia", label: "Mercearia", color: "#7c3aed" },
  { id: "bebidas", label: "Bebidas", color: "#0891b2" },
  { id: "limpeza", label: "Limpeza", color: "#0d9488" },
  { id: "higiene", label: "Higiene/Farmácia", color: "#db2777" },
  { id: "outros", label: "Outros", color: "#64748b" },
];

export const UNITS = ["un", "kg", "g", "L", "ml", "pct", "cx", "dz"];

export function categoryById(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
