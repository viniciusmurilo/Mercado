import { useEffect, useMemo, useState } from "react";
import { Shuffle, ShoppingCart } from "lucide-react";
import type { MealItem, Menu, Patient, ShoppingItemInput } from "../types";
import { aggregateDayPlans, PERIOD_LABEL, PERIOD_MULTIPLIER, type Period } from "../utils/aggregateDiet";
import { buildDayPlan } from "../utils/weekPlan";
import { DAY_LABELS } from "../data/meals";
import { CategoryBadge } from "./CategoryBadge";

interface WeeklyListGeneratorProps {
  patients: Patient[];
  menus: Menu[];
  mealItems: MealItem[];
  onGenerate: (items: ShoppingItemInput[]) => void;
}

/** patientId -> { menuId: peso/frequência } — apenas os cardápios selecionados aparecem no mapa. */
type Selection = Record<string, Record<string, number>>;

export function WeeklyListGenerator({ patients, menus, mealItems, onGenerate }: WeeklyListGeneratorProps) {
  const [period, setPeriod] = useState<Period>("semana");
  const [selection, setSelection] = useState<Selection>({});
  const [rerollSeed, setRerollSeed] = useState(0);

  useEffect(() => {
    setSelection((prev) => {
      const next: Selection = {};
      for (const patient of patients) {
        const patientMenuIds = menus.filter((m) => m.patientId === patient.id).map((m) => m.id);
        const prevSel = prev[patient.id];
        const cleaned: Record<string, number> = {};
        if (prevSel) {
          for (const menuId of patientMenuIds) {
            if (prevSel[menuId] !== undefined) cleaned[menuId] = prevSel[menuId];
          }
        }
        next[patient.id] =
          Object.keys(cleaned).length > 0 ? cleaned : patientMenuIds[0] ? { [patientMenuIds[0]]: 1 } : {};
      }
      return next;
    });
  }, [patients, menus]);

  function toggleMenu(patientId: string, menuId: string) {
    setSelection((prev) => {
      const patientSel = { ...(prev[patientId] ?? {}) };
      if (menuId in patientSel) delete patientSel[menuId];
      else patientSel[menuId] = 1;
      return { ...prev, [patientId]: patientSel };
    });
  }

  function setWeight(patientId: string, menuId: string, weight: number) {
    setSelection((prev) => ({
      ...prev,
      [patientId]: { ...(prev[patientId] ?? {}), [menuId]: weight },
    }));
  }

  const dayPlans = useMemo(() => {
    const days = PERIOD_MULTIPLIER[period];
    const result: Record<string, string[]> = {};
    for (const patient of patients) {
      const patientSel = selection[patient.id] ?? {};
      const menuIds = Object.keys(patientSel);
      if (menuIds.length === 0) continue;
      result[patient.id] = buildDayPlan(menuIds, patientSel, days);
    }
    return result;
    // rerollSeed é usado só para forçar um novo sorteio sob demanda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, period, patients, rerollSeed]);

  const aggregated = useMemo(() => aggregateDayPlans(mealItems, patients, dayPlans), [mealItems, patients, dayPlans]);

  const hasAnySelection = Object.values(dayPlans).some((plan) => plan.length > 0);

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
        Selecione um ou mais cardápios por paciente — o app sorteia qual usar em cada dia (sem repetir dias
        seguidos), respeitando o peso de cada um. Itens marcados como "Pronto" já entram convertidos para peso
        cru (de compra).
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {patients.map((patient) => {
          const patientMenus = menus.filter((m) => m.patientId === patient.id);
          const patientSel = selection[patient.id] ?? {};
          return (
            <div key={patient.id} className="rounded-lg border border-slate-200 p-3">
              <p className="mb-2 text-xs font-medium text-slate-600">Cardápios de {patient.name}</p>
              {patientMenus.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum cardápio cadastrado.</p>
              ) : (
                <div className="space-y-1.5">
                  {patientMenus.map((menu) => {
                    const selected = menu.id in patientSel;
                    return (
                      <div key={menu.id} className="flex items-center gap-2">
                        <label className="flex flex-1 items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleMenu(patient.id, menu.id)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          {menu.name}
                        </label>
                        {selected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-400">peso</span>
                            <input
                              type="number"
                              min="1"
                              value={patientSel[menu.id]}
                              onChange={(e) => setWeight(patient.id, menu.id, Math.max(1, Number(e.target.value) || 1))}
                              className="w-12 rounded-md border border-slate-300 px-1.5 py-1 text-xs text-right outline-none focus:border-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasAnySelection && (
        <div className="mb-4 space-y-2 rounded-lg bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">
              {period === "semana" ? "Escala da semana (sorteada)" : "Distribuição sorteada para o mês"}
            </p>
            <button
              type="button"
              onClick={() => setRerollSeed((s) => s + 1)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Shuffle size={12} /> Sortear novamente
            </button>
          </div>
          {period === "semana" &&
            patients.map((patient) => {
              const plan = dayPlans[patient.id];
              if (!plan || plan.length === 0) return null;
              return (
                <p key={patient.id} className="text-xs text-slate-600">
                  <span className="font-medium">{patient.name}:</span>{" "}
                  {plan
                    .map((menuId, i) => `${DAY_LABELS[i] ?? `D${i + 1}`} ${menus.find((m) => m.id === menuId)?.name ?? "?"}`)
                    .join(" · ")}
                </p>
              );
            })}
        </div>
      )}

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
