import { categoryById } from "../data/categories";

export function CategoryBadge({ categoryId }: { categoryId: string }) {
  const category = categoryById(categoryId);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${category.color}1a`, color: category.color }}
    >
      {category.label}
    </span>
  );
}
