"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useKeyboardShortcutsContext } from "@/contexts/KeyboardShortcutsContext";
import { NotificationBell } from "@/components/NotificationBell";
import { Menu, Search, Keyboard, Settings } from "lucide-react";

// Map paths to page titles
const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/campaigns": "Campaigns",
  "/orders": "Orders",
  "/analytics/attribution": "Attribution",
  "/analytics/cohorts": "Cohorts",
  "/analytics/funnel": "Funnel",
  "/analytics/anomalies": "Anomalies",
  "/analytics/reports": "Reports",
  "/integrations": "Integrations",
  "/billing": "Billing",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const { toggle, isMobile, isTablet } = useSidebar();
  const { openCommandPalette, openHelpModal } = useKeyboardShortcutsContext();

  // Get title from exact path first, then try parent paths
  const title = pageTitles[pathname] ||
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path + "/"))?.[1] ||
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 lg:h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 lg:px-6 dark:border-slate-700 dark:bg-slate-900/95 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {(isMobile || isTablet) && (
          <button
            onClick={toggle}
            className="rounded-lg p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Mobile logo (shown only on smallest screens) */}
        {isMobile && (
          <Link href="/dashboard" className="font-bold text-primary-600 dark:text-primary-400 lg:hidden">
            OTQ
          </Link>
        )}

        {/* Page title */}
        <h1 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Command palette button - desktop only */}
        <button
          onClick={openCommandPalette}
          className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 hover:bg-white hover:text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all duration-200"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
          <span className="hidden xl:inline text-slate-400 dark:text-slate-500">Search...</span>
          <kbd className="ml-1 rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 border border-slate-200 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Keyboard shortcuts hint - desktop only */}
        <button
          onClick={openHelpModal}
          className="hidden lg:flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-5 w-5" />
        </button>

        {/* Notification bell - hidden on small mobile */}
        <div className="hidden sm:block">
          <NotificationBell />
        </div>

        {/* Settings link - hidden on mobile */}
        <Link
          href="/settings"
          className="hidden md:flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>

        {/* Beta badge */}
        <span className="rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-2.5 lg:px-3 py-0.5 lg:py-1 text-[10px] lg:text-xs font-semibold text-white shadow-sm">
          Beta
        </span>
      </div>
    </header>
  );
}

