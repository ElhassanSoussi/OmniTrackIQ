export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value || 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}
