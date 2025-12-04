export function formatCurrency(value: number | string | null | undefined, currency = "USD") {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
    minimumFractionDigits: 0,
  });
}

export function formatNumber(value: number | string | null | undefined) {
  const num = Number(value || 0);
  return num.toLocaleString("en-US");
}
