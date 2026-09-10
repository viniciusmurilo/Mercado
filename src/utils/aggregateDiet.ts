import type { MealItem, Patient } from "../types";

export type Period = "semana" | "mes";

export const PERIOD_MULTIPLIER: Record<Period, number> = {
  semana: 7,
  mes: 30,
};

export const PERIOD_LABEL: Record<Period, string> = {
  semana: "Semana",
  mes: "Mês (aprox.)",
};

export interface AggregatedBreakdown {
  patientId: string;
  patientName: string;
  quantity: number;
  unit: string;
}

export interface AggregatedItem {
  key: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  breakdown: AggregatedBreakdown[];
}

const MASS_TO_G: Record<string, number> = { g: 1, kg: 1000 };
const VOLUME_TO_ML: Record<string, number> = { ml: 1, L: 1000 };

function unitFamily(unit: string): "mass" | "volume" | "count" {
  if (unit in MASS_TO_G) return "mass";
  if (unit in VOLUME_TO_ML) return "volume";
  return "count";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Sums ingredients across the 4 daily meals of each patient's selected menu,
 * then projects the total for the given period (week/month), converting
 * compatible units (g<->kg, ml<->L) so quantities from different meals add up.
 */
export function aggregateMenuItems(
  mealItems: MealItem[],
  patients: Patient[],
  selection: Record<string, string | undefined>,
  period: Period,
): AggregatedItem[] {
  const patientNameById = new Map(patients.map((p) => [p.id, p.name]));
  const multiplier = PERIOD_MULTIPLIER[period];

  const groups = new Map<
    string,
    {
      name: string;
      category: string;
      family: "mass" | "volume" | "count";
      unit: string;
      byPatient: Map<string, number>;
    }
  >();

  for (const patient of patients) {
    const menuId = selection[patient.id];
    if (!menuId) continue;

    for (const item of mealItems) {
      if (item.menuId !== menuId) continue;

      const normName = item.name.trim().toLowerCase();
      const family = unitFamily(item.unit);
      const groupKey = family === "count" ? `${normName}|${item.unit}` : `${normName}|${family}`;
      const baseQty =
        family === "mass"
          ? item.quantity * MASS_TO_G[item.unit]
          : family === "volume"
            ? item.quantity * VOLUME_TO_ML[item.unit]
            : item.quantity;

      let group = groups.get(groupKey);
      if (!group) {
        group = { name: item.name.trim(), category: item.category, family, unit: item.unit, byPatient: new Map() };
        groups.set(groupKey, group);
      }
      group.byPatient.set(patient.id, (group.byPatient.get(patient.id) ?? 0) + baseQty * multiplier);
    }
  }

  return Array.from(groups.values())
    .map((g) => {
      const totalBase = Array.from(g.byPatient.values()).reduce((a, b) => a + b, 0);
      let displayUnit = g.unit;
      let displayQty = totalBase;
      if (g.family === "mass") {
        displayUnit = totalBase >= 1000 ? "kg" : "g";
        displayQty = displayUnit === "kg" ? totalBase / 1000 : totalBase;
      } else if (g.family === "volume") {
        displayUnit = totalBase >= 1000 ? "L" : "ml";
        displayQty = displayUnit === "L" ? totalBase / 1000 : totalBase;
      }

      const breakdown: AggregatedBreakdown[] = Array.from(g.byPatient.entries()).map(([patientId, baseQty]) => {
        let qty = baseQty;
        if (g.family === "mass") qty = displayUnit === "kg" ? baseQty / 1000 : baseQty;
        if (g.family === "volume") qty = displayUnit === "L" ? baseQty / 1000 : baseQty;
        return {
          patientId,
          patientName: patientNameById.get(patientId) ?? "—",
          quantity: round2(qty),
          unit: displayUnit,
        };
      });

      return {
        key: `${g.name.toLowerCase()}|${g.family}|${g.unit}`,
        name: g.name,
        category: g.category,
        quantity: round2(displayQty),
        unit: displayUnit,
        breakdown,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
