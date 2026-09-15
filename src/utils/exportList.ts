import jsPDF from "jspdf";
import type { ShoppingItem } from "../types";
import { categoryById } from "../data/categories";

export function buildListText(items: ShoppingItem[]): string {
  const pending = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  const grouped = new Map<string, ShoppingItem[]>();
  for (const item of pending) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const lines: string[] = [];
  lines.push("🛒 *Lista de Compras*");
  lines.push("");

  if (pending.length === 0) {
    lines.push("Nenhum item pendente.");
  } else {
    for (const [categoryId, catItems] of grouped) {
      lines.push(`*${categoryById(categoryId).label}*`);
      for (const item of catItems) {
        lines.push(`- ${item.name} — ${item.quantity} ${item.unit}`);
      }
      lines.push("");
    }
  }

  if (done.length > 0) {
    lines.push(`✅ Já no carrinho (${done.length}):`);
    for (const item of done) {
      lines.push(`- ${item.name}`);
    }
  }

  return lines.join("\n").trim();
}

const PINK = "#db2777";
const DARK = "#1f2937";
const GRAY = "#64748b";
const GREEN = "#16a34a";

function buildListPdf(items: ShoppingItem[]): jsPDF {
  const pending = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  const grouped = new Map<string, ShoppingItem[]>();
  for (const item of pending) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  let y = 56;

  function ensureSpace(lineHeight: number) {
    if (y + lineHeight > pageHeight - 48) {
      doc.addPage();
      y = 56;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(PINK);
  doc.text("Lista de Compras", marginX, y);
  y += 10;
  doc.setDrawColor(PINK);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(GRAY);
  const dateLabel = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Gerada em ${dateLabel}`, marginX, y);
  y += 26;

  if (pending.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(GRAY);
    doc.text("Nenhum item pendente.", marginX, y);
    y += 20;
  } else {
    for (const [categoryId, catItems] of grouped) {
      ensureSpace(28);
      const category = categoryById(categoryId);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(category.color);
      doc.text(category.label, marginX, y);
      y += 18;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(DARK);
      for (const item of catItems) {
        ensureSpace(18);
        doc.setDrawColor(GRAY);
        doc.rect(marginX, y - 9, 9, 9);
        doc.text(`${item.name} — ${item.quantity} ${item.unit}`, marginX + 16, y);
        y += 18;
      }
      y += 10;
    }
  }

  if (done.length > 0) {
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(GREEN);
    doc.text(`Já no carrinho (${done.length})`, marginX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(GRAY);
    for (const item of done) {
      ensureSpace(14);
      doc.text(`✓ ${item.name}`, marginX + 4, y);
      y += 14;
    }
  }

  return doc;
}

function pdfFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `lista-de-compras-${date}.pdf`;
}

export function downloadListAsPdf(items: ShoppingItem[]) {
  buildListPdf(items).save(pdfFilename());
}

export function whatsappShareUrl(items: ShoppingItem[]): string {
  const text = buildListText(items);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export type ShareResult = "shared" | "cancelled" | "fallback-download";

/**
 * Tenta compartilhar a lista já em PDF pelo share sheet nativo (o usuário
 * escolhe o WhatsApp entre os apps disponíveis, com o arquivo anexado).
 * Em navegadores sem suporte a compartilhar arquivos (a maioria dos
 * desktops), baixa o PDF e abre o WhatsApp Web com o texto da lista, já
 * que não é possível anexar arquivo automaticamente por um link wa.me.
 */
export async function shareListAsPdf(items: ShoppingItem[]): Promise<ShareResult> {
  const doc = buildListPdf(items);
  const filename = pdfFilename();
  const blob = doc.output("blob");

  if (typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator) {
    try {
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Lista de Compras",
          text: "Lista de compras da semana",
        });
        return "shared";
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "cancelled";
      // outros erros caem no fallback abaixo
    }
  }

  doc.save(filename);
  window.open(whatsappShareUrl(items), "_blank", "noopener,noreferrer");
  return "fallback-download";
}
