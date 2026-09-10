import { useMemo, useState } from "react";
import type { MealItem, Patient } from "../types";
import { aggregateMenuItems, PERIOD_LABEL, type Period } from "../utils/aggregateDiet";
import { CategoryBadge } from "./CategoryBadge";

interface MenuSummaryProps {
  patient: Patient;
  menuId: string;
  mealItems: MealItem[];
}

export function MenuSummary({ patient, menuId, mealItems }: MenuSummaryProps) {
  const [period, setPeriod] = useState<Period>("semana");

  const selection = useMemo(() => ({ [patient.id]: menuId }), [patient.id, menuId]);

  const aggregated = useMemo(
    () => aggregateMenuItems(mealItems, [patient], selection, period),
    [mealItems, patient, selection, period],
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Resumo de consumo — {patient.name}</h3>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
          {(["semana", "mes"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>
      {aggregated.length === 0 ? (
        <p className="text-xs text-slate-400">Cadastre alimentos nas refeições para ver o resumo.</p>
      ) : (
        <ul className="space-y-1.5">
          {aggregated.map((item) => (
            <li key={item.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                {item.name} <CategoryBadge categoryId={item.category} />
              </span>
              <span className="font-medium text-slate-900">
                {item.quantity} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
