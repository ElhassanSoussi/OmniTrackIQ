export function getDefaultDateRange(days = 7) {
  const today = new Date();
  const to = today.toISOString().split("T")[0];
  const start = new Date();
  start.setDate(today.getDate() - (days - 1));
  const from = start.toISOString().split("T")[0];
  return { from, to };
}
