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

export function downloadListAsText(items: ShoppingItem[]) {
  const text = buildListText(items);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `lista-de-compras-${date}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function whatsappShareUrl(items: ShoppingItem[]): string {
  const text = buildListText(items);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
