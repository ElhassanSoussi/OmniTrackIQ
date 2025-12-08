
export type DateRangeValue = "7d" | "30d" | "90d";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function getDateRange(range: DateRangeValue) {
  const to = new Date();
  const from = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  from.setDate(to.getDate() - (days - 1));

  return { from: formatDate(from), to: formatDate(to) };
}
