"use client";

import { useTheme } from "@/hooks/useTheme";

const themes = [
  { value: "light", label: "Light", description: "Always use light mode" },
  { value: "dark", label: "Dark", description: "Always use dark mode" },
  { value: "system", label: "System", description: "Match your device settings" },
] as const;

export default function AppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Customize how OmniTrackIQ looks on your device.
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <a href="/settings" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap">
          Profile
        </a>
        <a href="/settings/team" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap">
          Team
        </a>
        <a href="/settings/views" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap">
          Saved Views
        </a>
        <a href="/settings/reports" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap">
          Reports
        </a>
        <a href="/settings/appearance" className="border-b-2 border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          Appearance
        </a>
      </div>

      {/* Theme Selection */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="space-y-1 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select your preferred color scheme. Current: <span className="font-medium capitalize">{resolvedTheme}</span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex flex-col items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                theme === t.value
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              {/* Theme Preview */}
              <div className={`w-full h-20 rounded-lg overflow-hidden border ${
                t.value === "dark" 
                  ? "bg-gray-900 border-gray-700" 
                  : t.value === "light"
                  ? "bg-white border-gray-200"
                  : "bg-gradient-to-r from-white to-gray-900 border-gray-300"
              }`}>
                <div className={`h-5 ${
                  t.value === "dark" 
                    ? "bg-gray-800" 
                    : t.value === "light"
                    ? "bg-gray-100"
                    : "bg-gradient-to-r from-gray-100 to-gray-800"
                }`} />
                <div className="p-2 space-y-1">
                  <div className={`h-2 w-12 rounded ${
                    t.value === "dark" 
                      ? "bg-gray-700" 
                      : t.value === "light"
                      ? "bg-gray-200"
                      : "bg-gradient-to-r from-gray-200 to-gray-700"
                  }`} />
                  <div className={`h-2 w-8 rounded ${
                    t.value === "dark" 
                      ? "bg-gray-700" 
                      : t.value === "light"
                      ? "bg-gray-200"
                      : "bg-gradient-to-r from-gray-200 to-gray-700"
                  }`} />
                </div>
              </div>

              {/* Theme Info */}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${
                    theme === t.value 
                      ? "text-emerald-700 dark:text-emerald-400" 
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {t.label}
                  </span>
                  {theme === t.value && (
                    <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className={`text-xs ${
                  theme === t.value 
                    ? "text-emerald-600 dark:text-emerald-500" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {t.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="space-y-1 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Additional display settings coming soon.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reduce spacing for more dense display</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Coming soon
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Reduced Motion</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Minimize animations throughout the app</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
