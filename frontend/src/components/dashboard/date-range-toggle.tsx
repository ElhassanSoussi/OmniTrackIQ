const ranges = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export type DateRangeValue = (typeof ranges)[number]["value"];

interface DateRangeToggleProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export function DateRangeToggle({ value, onChange }: DateRangeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 text-sm font-medium shadow-sm">
      {ranges.map((range) => {
        const active = value === range.value;
        return (
          <button
            key={range.value}
            type="button"
            onClick={() => onChange(range.value)}
            className={`rounded-md px-3 py-1.5 transition ${
              active
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
