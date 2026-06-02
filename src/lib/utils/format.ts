export function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: Math.abs(value) >= 100000 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
}
