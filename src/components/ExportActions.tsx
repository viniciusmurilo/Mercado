import { useState } from "react";
import { Download, Loader2, MessageCircle, Trash2 } from "lucide-react";
import type { ShoppingItem } from "../types";
import { downloadListAsPdf, shareListAsPdf } from "../utils/exportList";

interface ExportActionsProps {
  items: ShoppingItem[];
  onClearChecked: () => void;
  hasChecked: boolean;
}

export function ExportActions({ items, onClearChecked, hasChecked }: ExportActionsProps) {
  const disabled = items.length === 0;
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (disabled || sharing) return;
    setSharing(true);
    try {
      await shareListAsPdf(items);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => downloadListAsPdf(items)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={16} />
        Baixar lista (PDF)
      </button>

      <button
        type="button"
        disabled={disabled || sharing}
        onClick={handleShare}
        className="flex items-center gap-2 rounded-lg bg-pink-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sharing ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        Compartilhar no WhatsApp
      </button>

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
