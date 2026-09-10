import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Patient } from "../types";

interface PatientTabsProps {
  patients: Patient[];
  activePatientId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function PatientTabs({ patients, activePatientId, onSelect, onAdd, onRemove }: PatientTabsProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  function submitAdd() {
    const trimmed = name.trim();
    if (trimmed) onAdd(trimmed);
    setName("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {patients.map((patient) => (
        <div key={patient.id} className="group relative">
          <button
            type="button"
            onClick={() => onSelect(patient.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activePatientId === patient.id
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {patient.name}
          </button>
          {patients.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(patient.id)}
              className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white hover:bg-red-500 group-hover:flex"
              aria-label={`Remover ${patient.name}`}
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
            onBlur={submitAdd}
            placeholder="Nome do paciente"
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
        >
          <Plus size={14} /> Paciente
        </button>
      )}
    </div>
  );
}
