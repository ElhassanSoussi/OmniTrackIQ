import { Fragment } from "react";

const ranges = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

export type DateRangeValue = (typeof ranges)[number]["value"];

interface DateRangeToggleProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

export function DateRangeToggle({ value, onChange }: DateRangeToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 p-1 text-xs font-semibold text-slate-200 shadow-inner shadow-black/20">
      {ranges.map((range, idx) => {
        const active = value === range.value;
        return (
          <Fragment key={range.value}>
            <button
              type="button"
              onClick={() => onChange(range.value)}
              className={`rounded-full px-3 py-1 transition ${
                active ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30" : "text-slate-300 hover:text-white"
              }`}
            >
              {range.label}
            </button>
            {idx < ranges.length - 1 && <div className="h-4 w-px bg-slate-800" aria-hidden />}
          </Fragment>
        );
      })}
    </div>
  );
}
