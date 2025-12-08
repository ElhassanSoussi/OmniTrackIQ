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

export function formatPercent(value: number | string | null | undefined, decimals = 1) {
  const num = Number(value || 0);
  return `${num.toFixed(decimals)}%`;
}

/**
 * Safely formats an error into a human-readable string.
 * Handles Error objects, strings, and unknown error types.
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}
