"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Map paths to page titles
const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/campaigns": "Campaigns",
  "/orders": "Orders",
  "/integrations": "Integrations",
  "/billing": "Billing",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          Settings
        </Link>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Beta
        </span>
      </div>
    </header>
  );
}
