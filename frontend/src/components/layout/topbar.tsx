"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useKeyboardShortcutsContext } from "@/contexts/KeyboardShortcutsContext";
import { NotificationBell } from "@/components/NotificationBell";

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

function HamburgerIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function Topbar() {
  const pathname = usePathname();
  const { toggle, isMobile, isTablet } = useSidebar();
  const { openCommandPalette, openHelpModal } = useKeyboardShortcutsContext();
  
  // Get title from exact path first, then try parent paths
  const title = pageTitles[pathname] || 
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path + "/"))?.[1] || 
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 lg:h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 lg:px-6 dark:border-gray-800 dark:bg-gray-900/95 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {(isMobile || isTablet) && (
          <button
            onClick={toggle}
            className="rounded-lg p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden"
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
        )}
        
        {/* Mobile logo (shown only on smallest screens) */}
        {isMobile && (
          <Link href="/dashboard" className="font-bold text-gray-900 dark:text-white lg:hidden">
            OTQ
          </Link>
        )}
        
        {/* Page title */}
        <h1 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Command palette button - desktop only */}
        <button
          onClick={openCommandPalette}
          className="hidden lg:flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          aria-label="Open command palette"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden xl:inline">Search...</span>
          <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] dark:bg-gray-700">⌘K</kbd>
        </button>

        {/* Keyboard shortcuts hint - desktop only */}
        <button
          onClick={openHelpModal}
          className="hidden lg:flex rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>

        {/* Notification bell - hidden on small mobile */}
        <div className="hidden sm:block">
          <NotificationBell />
        </div>

        {/* Settings link - hidden on mobile */}
        <Link
          href="/settings"
          className="hidden md:flex text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          Settings
        </Link>

        {/* Beta badge */}
        <span className="rounded-full bg-emerald-100 px-2 lg:px-3 py-0.5 lg:py-1 text-[10px] lg:text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Beta
        </span>
      </div>
    </header>
  );
}
