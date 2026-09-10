/**
 * Monta a escala de N dias sorteando entre os cardápios selecionados,
 * respeitando o peso/frequência de cada um (ex: peso 3/2/2 em 7 dias vira
 * 3 dias do primeiro, 2 do segundo, 2 do terceiro) e evitando repetir o
 * mesmo cardápio em dias consecutivos sempre que possível.
 */
export function buildDayPlan(menuIds: string[], weights: Record<string, number>, days: number): string[] {
  if (menuIds.length === 0 || days <= 0) return [];
  if (menuIds.length === 1) return Array(days).fill(menuIds[0]);

  const totalWeight = menuIds.reduce((sum, id) => sum + Math.max(0, weights[id] ?? 1), 0) || menuIds.length;

  const quotas = menuIds.map((id) => {
    const w = Math.max(0, weights[id] ?? 1) || 1;
    const exact = (w / totalWeight) * days;
    return { id, count: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  const allocated = quotas.reduce((sum, q) => sum + q.count, 0);
  const remaining = days - allocated;
  const byRemainder = [...quotas].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < remaining; i++) {
    byRemainder[i % byRemainder.length].count += 1;
  }

  const pool: string[] = [];
  for (const q of quotas) {
    for (let i = 0; i < q.count; i++) pool.push(q.id);
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Melhor esforço: evita o mesmo cardápio em dias consecutivos.
  for (let pass = 0; pass < 20; pass++) {
    let hasAdjacentDup = false;
    for (let i = 1; i < pool.length; i++) {
      if (pool[i] !== pool[i - 1]) continue;
      hasAdjacentDup = true;
      for (let j = i + 1; j < pool.length; j++) {
        const wouldFixLeft = pool[j] !== pool[i - 1];
        const wouldFixRight = j === pool.length - 1 || pool[j + 1] !== pool[i];
        if (pool[j] !== pool[i] && wouldFixLeft && wouldFixRight) {
          [pool[i], pool[j]] = [pool[j], pool[i]];
          break;
        }
      }
    }
    if (!hasAdjacentDup) break;
  }

  return pool;
}
