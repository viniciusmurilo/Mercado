import { useEffect, useState } from "react";
import type { MealId, MealItem, MealItemInput, Menu, Patient, ShoppingItemInput } from "../types";
import { MEALS } from "../data/meals";
import { PatientTabs } from "../components/PatientTabs";
import { MenuTabs } from "../components/MenuTabs";
import { MealSection } from "../components/MealSection";
import { MenuSummary } from "../components/MenuSummary";
import { WeeklyListGenerator } from "../components/WeeklyListGenerator";

interface DietPlansPageProps {
  patients: Patient[];
  menus: Menu[];
  mealItems: MealItem[];
  onAddPatient: (name: string) => void;
  onRemovePatient: (id: string) => void;
  onAddMenu: (patientId: string) => void;
  onRemoveMenu: (id: string) => void;
  onRenameMenu: (id: string, name: string) => void;
  onAddMealItem: (menuId: string, meal: MealId, input: MealItemInput) => void;
  onRemoveMealItem: (id: string) => void;
  onChangeMealItemQuantity: (id: string, quantity: number) => void;
  onGenerateList: (items: ShoppingItemInput[]) => void;
}

export function DietPlansPage({
  patients,
  menus,
  mealItems,
  onAddPatient,
  onRemovePatient,
  onAddMenu,
  onRemoveMenu,
  onRenameMenu,
  onAddMealItem,
  onRemoveMealItem,
  onChangeMealItemQuantity,
  onGenerateList,
}: DietPlansPageProps) {
  const [activePatientId, setActivePatientId] = useState(patients[0]?.id ?? "");
  const [activeMenuId, setActiveMenuId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!patients.some((p) => p.id === activePatientId)) {
      setActivePatientId(patients[0]?.id ?? "");
    }
  }, [patients, activePatientId]);

  const activePatient = patients.find((p) => p.id === activePatientId) ?? patients[0];
  const patientMenus = menus.filter((m) => m.patientId === activePatient?.id);

  useEffect(() => {
    if (!activePatient) return;
    if (!patientMenus.some((m) => m.id === activeMenuId)) {
      setActiveMenuId(patientMenus[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatient?.id, menus]);

  const activeMenuItems = mealItems.filter((mi) => mi.menuId === activeMenuId);

  return (
    <div className="space-y-6">
      <WeeklyListGenerator patients={patients} menus={menus} mealItems={mealItems} onGenerate={onGenerateList} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Cadastro dos planos alimentares</h2>

        <PatientTabs
          patients={patients}
          activePatientId={activePatient?.id ?? ""}
          onSelect={setActivePatientId}
          onAdd={onAddPatient}
          onRemove={onRemovePatient}
        />

        {activePatient ? (
          <>
            <div className="mb-4 mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium text-slate-500">Cardápios de {activePatient.name}</p>
              <MenuTabs
                menus={patientMenus}
                activeMenuId={activeMenuId}
                onSelect={setActiveMenuId}
                onAdd={() => onAddMenu(activePatient.id)}
                onRemove={onRemoveMenu}
                onRename={onRenameMenu}
              />
            </div>

            {activeMenuId ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {MEALS.map((meal) => (
                    <MealSection
                      key={meal.id}
                      meal={meal}
                      items={activeMenuItems.filter((mi) => mi.meal === meal.id)}
                      onAdd={(input) => onAddMealItem(activeMenuId, meal.id, input)}
                      onRemove={onRemoveMealItem}
                      onChangeQuantity={onChangeMealItemQuantity}
                    />
                  ))}
                </div>
                <MenuSummary patient={activePatient} menuId={activeMenuId} mealItems={mealItems} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Crie um cardápio para começar.</p>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Adicione um paciente para começar.</p>
        )}
      </div>
    </div>
  );
}
