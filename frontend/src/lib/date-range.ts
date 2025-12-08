export type DateRangeValue = "7d" | "30d" | "90d" | "custom";

export interface CustomDateRange {
  from: string;
  to: string;
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Get date range from preset value or custom range
 */
export function getDateRange(
  range: DateRangeValue | string, 
  customRange?: CustomDateRange
): { from: string; to: string } {
  // If custom range with values provided
  if (range === "custom" && customRange?.from && customRange?.to) {
    return { from: customRange.from, to: customRange.to };
  }

  const to = new Date();
  const from = new Date();
  
  let days: number;
  switch (range) {
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "90d":
      days = 90;
      break;
    case "custom":
      // Default to 30 days if custom but no range provided
      days = 30;
      break;
    default:
      // Try to parse as number of days
      days = parseInt(range, 10) || 30;
  }
  
  from.setDate(to.getDate() - (days - 1));

  return { from: formatDate(from), to: formatDate(to) };
}

/**
 * Format date range for display
 */
export function formatDateRangeLabel(from: string, to: string): string {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const fromStr = fromDate.toLocaleDateString("en-US", options);
  const toStr = toDate.toLocaleDateString("en-US", options);
  
  // If same year as current, don't show year
  const currentYear = new Date().getFullYear();
  if (fromDate.getFullYear() === currentYear && toDate.getFullYear() === currentYear) {
    return `${fromStr} - ${toStr}`;
  }
  
  // Show year for both
  const optionsWithYear: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${fromDate.toLocaleDateString("en-US", optionsWithYear)} - ${toDate.toLocaleDateString("en-US", optionsWithYear)}`;
}

/**
 * Calculate number of days in range
 */
export function getDaysInRange(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}
