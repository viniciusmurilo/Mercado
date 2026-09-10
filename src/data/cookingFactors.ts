export interface CookingFactorEntry {
  match: string;
  factor: number;
}

/**
 * Fatores de cocção aproximados (peso pronto ÷ fator = peso cru/de compra).
 * Valores de referência comuns em tabelas de nutrição — variam conforme o
 * método de preparo, por isso são apenas uma sugestão inicial editável.
 * Entradas mais específicas ficam antes das mais genéricas (match por
 * substring, a primeira ocorrência encontrada é usada).
 */
export const COOKING_FACTORS: CookingFactorEntry[] = [
  { match: "arroz integral", factor: 2.8 },
  { match: "arroz", factor: 2.4 },
  { match: "feijão", factor: 2.2 },
  { match: "lentilha", factor: 2.4 },
  { match: "grão-de-bico", factor: 2.0 },
  { match: "grão de bico", factor: 2.0 },
  { match: "macarrão", factor: 2.3 },
  { match: "espaguete", factor: 2.3 },
  { match: "quinoa", factor: 2.8 },
  { match: "aveia", factor: 2.0 },
  { match: "carne moída", factor: 0.7 },
  { match: "carne", factor: 0.7 },
  { match: "frango", factor: 0.7 },
  { match: "peixe", factor: 0.75 },
  { match: "filé", factor: 0.75 },
  { match: "file", factor: 0.75 },
  { match: "batata-doce", factor: 1.0 },
  { match: "batata", factor: 0.95 },
  { match: "mandioca", factor: 1.0 },
  { match: "ovo", factor: 1.0 },
];

export function suggestCookingFactor(name: string): number | null {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const entry = COOKING_FACTORS.find((e) =>
    normalized.includes(
      e.match
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, ""),
    ),
  );
  return entry ? entry.factor : null;
}
