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

type Family = "mass" | "volume" | "count";

interface Group {
  name: string;
  category: string;
  family: Family;
  unit: string;
  byPatient: Map<string, number>;
}

const MASS_TO_G: Record<string, number> = { g: 1, kg: 1000 };
const VOLUME_TO_ML: Record<string, number> = { ml: 1, L: 1000 };

function unitFamily(unit: string): Family {
  if (unit in MASS_TO_G) return "mass";
  if (unit in VOLUME_TO_ML) return "volume";
  return "count";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Converte a quantidade de um item para peso de compra (cru) em unidade base (g/ml/un). */
function purchaseBaseQuantity(item: MealItem): { family: Family; baseQty: number } {
  const family = unitFamily(item.unit);
  const factor = item.factor && item.factor > 0 ? item.factor : 1;
  const purchaseQuantity = item.preparation === "pronto" ? item.quantity / factor : item.quantity;
  const baseQty =
    family === "mass"
      ? purchaseQuantity * MASS_TO_G[item.unit]
      : family === "volume"
        ? purchaseQuantity * VOLUME_TO_ML[item.unit]
        : purchaseQuantity;
  return { family, baseQty };
}

function addToGroups(groups: Map<string, Group>, item: MealItem, patientId: string, multiplier: number) {
  const normName = item.name.trim().toLowerCase();
  const { family, baseQty } = purchaseBaseQuantity(item);
  const groupKey = family === "count" ? `${normName}|${item.unit}` : `${normName}|${family}`;

  let group = groups.get(groupKey);
  if (!group) {
    group = { name: item.name.trim(), category: item.category, family, unit: item.unit, byPatient: new Map() };
    groups.set(groupKey, group);
  }
  group.byPatient.set(patientId, (group.byPatient.get(patientId) ?? 0) + baseQty * multiplier);
}

function finalizeGroups(groups: Map<string, Group>, patients: Patient[]): AggregatedItem[] {
  const patientNameById = new Map(patients.map((p) => [p.id, p.name]));

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

/**
 * Sums ingredients across the 4 daily meals of a single menu per patient,
 * then projects the total for the given period (week/month). Items marked
 * "pronto" are converted to purchase (raw) weight via their cooking factor
 * before summing, and compatible units (g<->kg, ml<->L) are combined so
 * quantities from different meals add up correctly.
 */
export function aggregateMenuItems(
  mealItems: MealItem[],
  patients: Patient[],
  selection: Record<string, string | undefined>,
  period: Period,
): AggregatedItem[] {
  const multiplier = PERIOD_MULTIPLIER[period];
  const groups = new Map<string, Group>();

  for (const patient of patients) {
    const menuId = selection[patient.id];
    if (!menuId) continue;
    for (const item of mealItems) {
      if (item.menuId !== menuId) continue;
      addToGroups(groups, item, patient.id, multiplier);
    }
  }

  return finalizeGroups(groups, patients);
}

/**
 * Sums ingredients across a day-by-day menu schedule per patient (one
 * menuId per day, as produced by buildDayPlan) — allowing different
 * cardápios to alternate across the week/month instead of repeating the
 * same one every day. Same purchase-weight and unit handling as above.
 */
export function aggregateDayPlans(
  mealItems: MealItem[],
  patients: Patient[],
  dayPlans: Record<string, string[] | undefined>,
): AggregatedItem[] {
  const groups = new Map<string, Group>();

  const itemsByMenu = new Map<string, MealItem[]>();
  for (const item of mealItems) {
    const list = itemsByMenu.get(item.menuId);
    if (list) list.push(item);
    else itemsByMenu.set(item.menuId, [item]);
  }

  for (const patient of patients) {
    const plan = dayPlans[patient.id];
    if (!plan) continue;
    for (const menuId of plan) {
      for (const item of itemsByMenu.get(menuId) ?? []) {
        addToGroups(groups, item, patient.id, 1);
      }
    }
  }

  return finalizeGroups(groups, patients);
}
