import { Download, MessageCircle, Trash2 } from "lucide-react";
import type { ShoppingItem } from "../types";
import { downloadListAsText, whatsappShareUrl } from "../utils/exportList";

interface ExportActionsProps {
  items: ShoppingItem[];
  onClearChecked: () => void;
  hasChecked: boolean;
}

export function ExportActions({ items, onClearChecked, hasChecked }: ExportActionsProps) {
  const disabled = items.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => downloadListAsText(items)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={16} />
        Baixar lista
      </button>

      <a
        href={disabled ? undefined : whatsappShareUrl(items)}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={disabled}
        className={`flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <MessageCircle size={16} />
        Compartilhar no WhatsApp
      </a>

      {hasChecked && (
        <button
          type="button"
          onClick={onClearChecked}
          className="ml-auto flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          <Trash2 size={16} />
          Limpar comprados
        </button>
      )}
    </div>
  );
}
