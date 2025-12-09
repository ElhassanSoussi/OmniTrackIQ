"use client";

import { useState, useRef, useEffect } from "react";

const ranges = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "Custom", value: "custom" },
];

export type DateRangeValue = "7d" | "30d" | "90d" | "custom";

export interface CustomDateRange {
  from: string;
  to: string;
}

interface DateRangeToggleProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  customRange?: CustomDateRange;
  onCustomRangeChange?: (range: CustomDateRange) => void;
}

export function DateRangeToggle({ 
  value, 
  onChange, 
  customRange,
  onCustomRangeChange 
}: DateRangeToggleProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempFrom, setTempFrom] = useState(customRange?.from || "");
  const [tempTo, setTempTo] = useState(customRange?.to || "");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowCustomPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update temp values when customRange changes
  useEffect(() => {
    if (customRange) {
      setTempFrom(customRange.from);
      setTempTo(customRange.to);
    }
  }, [customRange]);

  const handleRangeClick = (rangeValue: DateRangeValue) => {
    if (rangeValue === "custom") {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      onChange(rangeValue);
    }
  };

  const handleApplyCustomRange = () => {
    if (tempFrom && tempTo && onCustomRangeChange) {
      onCustomRangeChange({ from: tempFrom, to: tempTo });
      onChange("custom");
      setShowCustomPicker(false);
    }
  };

  const formatDateDisplay = () => {
    if (value === "custom" && customRange?.from && customRange?.to) {
      const from = new Date(customRange.from).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const to = new Date(customRange.to).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${from} - ${to}`;
    }
    return null;
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Mobile: Dropdown select */}
      <div className="sm:hidden">
        <select
          value={value}
          onChange={(e) => handleRangeClick(e.target.value as DateRangeValue)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {ranges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.value === "custom" && value === "custom" && formatDateDisplay()
                ? formatDateDisplay()
                : range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Button group */}
      <div className="hidden sm:inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 text-sm font-medium shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {ranges.map((range) => {
          const active = value === range.value;
          const isCustomActive = range.value === "custom" && value === "custom";
          
          return (
            <button
              key={range.value}
              type="button"
              onClick={() => handleRangeClick(range.value as DateRangeValue)}
              className={`rounded-md px-3 py-1.5 transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              }`}
            >
              {isCustomActive && formatDateDisplay() ? formatDateDisplay() : range.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Picker Dropdown */}
      {showCustomPicker && (
        <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:translate-y-0 sm:mt-2 w-auto sm:w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Custom Date Range</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Select start and end dates</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                max={tempTo || undefined}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                min={tempFrom || undefined}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Quick select</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "This week", days: 7 },
                { label: "This month", days: 30 },
                { label: "Last 60 days", days: 60 },
                { label: "This quarter", days: 90 },
                { label: "Last 6 months", days: 180 },
                { label: "This year", days: 365 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const to = new Date();
                    const from = new Date();
                    from.setDate(from.getDate() - preset.days);
                    setTempFrom(from.toISOString().split("T")[0]);
                    setTempTo(to.toISOString().split("T")[0]);
                  }}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomPicker(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCustomRange}
              disabled={!tempFrom || !tempTo}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
