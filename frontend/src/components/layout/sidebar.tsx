"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBilling } from "@/hooks/useBilling";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSidebar } from "@/contexts/SidebarContext";
import ClientSwitcher from "@/components/agency/ClientSwitcher";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/orders", label: "Orders" },
  { href: "/analytics/attribution", label: "Attribution" },
  { href: "/analytics/cohorts", label: "Cohorts" },
  { href: "/analytics/funnel", label: "Funnel" },
  { href: "/analytics/anomalies", label: "Anomalies" },
  { href: "/analytics/reports", label: "Reports" },
  { href: "/integrations", label: "Integrations" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { billing } = useBilling();

  const isAgencyPlan = billing?.plan === "agency" || billing?.plan === "enterprise";

  // Agency-specific links (only shown for agency plan)
  const agencyLinks = isAgencyPlan
    ? [
        { href: "/agency", label: "Agency Dashboard" },
        { href: "/agency/clients", label: "Manage Clients" },
      ]
    : [];

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gh-border px-4 lg:px-5 dark:border-gh-border-dark">
        <Link 
          href="/dashboard" 
          className="text-base font-semibold text-gh-text-primary dark:text-gh-text-primary-dark"
          onClick={onNavigate}
        >
          OmniTrackIQ
        </Link>
        <ThemeToggle />
      </div>

      {/* Client Switcher (Agency only) */}
      {isAgencyPlan && (
        <div className="border-b border-gh-border px-3 py-3 dark:border-gh-border-dark">
          <ClientSwitcher />
        </div>
      )}

      {/* Agency Navigation (Agency only) */}
      {isAgencyPlan && agencyLinks.length > 0 && (
        <div className="border-b border-gh-border px-2 lg:px-3 py-2 dark:border-gh-border-dark">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gh-text-tertiary dark:text-gh-text-tertiary-dark">
            Agency
          </p>
          {agencyLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gh-canvas-subtle text-gh-text-primary dark:bg-gh-canvas-subtle-dark dark:text-gh-text-primary-dark"
                    : "text-gh-text-secondary hover:bg-gh-canvas-subtle hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:bg-gh-canvas-subtle-dark dark:hover:text-gh-text-primary-dark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 lg:px-3 py-4">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-gh-canvas-subtle text-gh-text-primary dark:bg-gh-canvas-subtle-dark dark:text-gh-text-primary-dark"
                  : "text-gh-text-secondary hover:bg-gh-canvas-subtle hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:bg-gh-canvas-subtle-dark dark:hover:text-gh-text-primary-dark"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-gh-border p-4 dark:border-gh-border-dark">
        {user && (
          <div className="mb-3 truncate text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
            {user.email}
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gh-text-secondary transition-colors hover:bg-gh-canvas-subtle hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:bg-gh-canvas-subtle-dark dark:hover:text-gh-text-primary-dark"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { isOpen, close, isMobile, isTablet } = useSidebar();
  const showOverlay = (isMobile || isTablet) && isOpen;

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 lg:w-64 flex-col 
          border-r border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark 
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:transition-none
          ${showOverlay ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Close button for mobile */}
        {(isMobile || isTablet) && (
          <button
            onClick={close}
            className="absolute right-2 top-4 rounded-md p-2 text-gh-text-secondary hover:bg-gh-canvas-subtle hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:bg-gh-canvas-subtle-dark dark:hover:text-gh-text-primary-dark lg:hidden"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <SidebarContent onNavigate={isMobile || isTablet ? close : undefined} />
      </aside>
    </>
  );
}
