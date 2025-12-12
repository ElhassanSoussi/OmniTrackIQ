"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBilling } from "@/hooks/useBilling";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSidebar } from "@/contexts/SidebarContext";
import ClientSwitcher from "@/components/agency/ClientSwitcher";
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Users,
  GitBranch,
  AlertTriangle,
  FileText,
  Link2,
  CreditCard,
  Settings,
  Building2,
  UserCog,
  ShoppingCart,
  TrendingUp,
  LogOut,
  X,
  Zap,
} from "lucide-react";

// Navigation structure with icons and groups
const navigationGroups = [
  {
    name: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/campaigns", label: "Campaigns", icon: Target },
      { href: "/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
  {
    name: "Analytics",
    items: [
      { href: "/analytics/attribution", label: "Attribution", icon: GitBranch },
      { href: "/analytics/cohorts", label: "Cohorts", icon: Users },
      { href: "/analytics/funnel", label: "Funnel", icon: TrendingUp },
      { href: "/analytics/anomalies", label: "Anomalies", icon: AlertTriangle },
      { href: "/analytics/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    name: "Settings",
    items: [
      { href: "/integrations", label: "Integrations", icon: Link2 },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const agencyNavigation = {
  name: "Agency",
  items: [
    { href: "/agency", label: "Agency Dashboard", icon: Building2 },
    { href: "/agency/clients", label: "Manage Clients", icon: UserCog },
  ],
};

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        }`}
    >
      <Icon
        className={`h-5 w-5 transition-colors ${isActive
            ? "text-primary-600 dark:text-primary-400"
            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
          }`}
      />
      <span>{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { billing } = useBilling();

  const isAgencyPlan = billing?.plan === "agency" || billing?.plan === "enterprise";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={onNavigate}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            OmniTrackIQ
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Client Switcher (Agency only) */}
      {isAgencyPlan && (
        <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
          <ClientSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {/* Agency Navigation (Agency only) */}
        {isAgencyPlan && (
          <div className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {agencyNavigation.name}
            </p>
            <div className="space-y-1">
              {agencyNavigation.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation Groups */}
        {navigationGroups.map((group, index) => (
          <div
            key={group.name}
            className={index > 0 ? "mt-6" : ""}
          >
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.name}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-700">
        {user && (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-medium text-white">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {user.email?.split("@")[0] || "User"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-danger-50 hover:text-danger-700 dark:text-slate-400 dark:hover:bg-danger-900/20 dark:hover:text-danger-400"
        >
          <LogOut className="h-5 w-5" />
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 lg:w-64 flex-col 
          border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:transition-none
          ${showOverlay ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Close button for mobile */}
        {(isMobile || isTablet) && (
          <button
            onClick={close}
            className="absolute right-3 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <SidebarContent onNavigate={isMobile || isTablet ? close : undefined} />
      </aside>
    </>
  );
}

