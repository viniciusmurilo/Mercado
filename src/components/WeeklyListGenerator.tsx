import { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { MealItem, Menu, Patient, ShoppingItemInput } from "../types";
import { aggregateMenuItems, PERIOD_LABEL, type Period } from "../utils/aggregateDiet";
import { CategoryBadge } from "./CategoryBadge";

interface WeeklyListGeneratorProps {
  patients: Patient[];
  menus: Menu[];
  mealItems: MealItem[];
  onGenerate: (items: ShoppingItemInput[]) => void;
}

export function WeeklyListGenerator({ patients, menus, mealItems, onGenerate }: WeeklyListGeneratorProps) {
  const [period, setPeriod] = useState<Period>("semana");
  const [selection, setSelection] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelection((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const patient of patients) {
        const patientMenus = menus.filter((m) => m.patientId === patient.id);
        const stillValid = patientMenus.some((m) => m.id === next[patient.id]);
        if (!stillValid) {
          next[patient.id] = patientMenus[0]?.id ?? "";
          changed = true;
        }
      }
      for (const key of Object.keys(next)) {
        if (!patients.some((p) => p.id === key)) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [patients, menus]);

  const aggregated = useMemo(
    () => aggregateMenuItems(mealItems, patients, selection, period),
    [mealItems, patients, selection, period],
  );

  function handleGenerate() {
    onGenerate(aggregated.map((item) => ({ name: item.name, quantity: item.quantity, unit: item.unit, category: item.category })));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Gerar lista de compras a partir dos cardápios</h2>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
          {(["semana", "mes"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs text-slate-500">
        Alimentos marcados como "Pronto" nas refeições já entram aqui convertidos para peso cru (de compra),
        usando o fator de cocção cadastrado em cada item.
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {patients.map((patient) => {
          const patientMenus = menus.filter((m) => m.patientId === patient.id);
          return (
            <div key={patient.id}>
              <label className="mb-1 block text-xs font-medium text-slate-600">Cardápio de {patient.name}</label>
              <select
                value={selection[patient.id] ?? ""}
                onChange={(e) => setSelection((prev) => ({ ...prev, [patient.id]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Não incluir</option>
                {patientMenus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {aggregated.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
          Selecione os cardápios e cadastre alimentos nas refeições para ver a lista.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <ul className="divide-y divide-slate-100">
            {aggregated.map((item) => (
              <li key={item.key} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{item.name}</span>
                  <CategoryBadge categoryId={item.category} />
                </div>
                <div className="flex items-center gap-3">
                  {item.breakdown.length > 1 && (
                    <span className="text-xs text-slate-500">
                      {item.breakdown.map((b) => `${b.patientName} ${b.quantity}${b.unit}`).join(" + ")}
                    </span>
                  )}
                  <span className="font-semibold text-slate-900">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        disabled={aggregated.length === 0}
        onClick={handleGenerate}
        className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingCart size={16} />
        Adicionar {aggregated.length > 0 ? `${aggregated.length} itens` : ""} à lista de compras
      </button>
    </div>
  );
}
