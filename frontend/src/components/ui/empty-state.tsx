"use client";

import Link from "next/link";
import {
  BarChart3,
  Link2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  GitBranch,
  AlertTriangle,
  FileText,
  ShoppingCart,
  Users,
  Settings
} from "lucide-react";

type EmptyStateVariant =
  | "default"
  | "no-integrations"
  | "error"
  | "coming-soon";

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: "chart" | "integrations" | "campaigns" | "orders" | "team" | "settings" | "branch" | "alert" | "trend" | "sparkles";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  showDemoHint?: boolean;
}

const ICONS = {
  chart: BarChart3,
  integrations: Link2,
  campaigns: Target,
  orders: ShoppingCart,
  team: Users,
  settings: Settings,
  branch: GitBranch,
  alert: AlertTriangle,
  trend: TrendingUp,
  sparkles: Sparkles,
};

const VARIANT_STYLES = {
  default: {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50",
    border: "border-slate-200 dark:border-slate-700",
    iconBg: "bg-white dark:bg-slate-700 shadow-sm",
    iconColor: "text-slate-400 dark:text-slate-500",
  },
  "no-integrations": {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-white dark:bg-blue-900/50 shadow-sm",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  error: {
    bg: "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
    border: "border-red-200 dark:border-red-800",
    iconBg: "bg-white dark:bg-red-900/50 shadow-sm",
    iconColor: "text-red-500 dark:text-red-400",
  },
  "coming-soon": {
    bg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    border: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-white dark:bg-purple-900/50 shadow-sm",
    iconColor: "text-purple-500 dark:text-purple-400",
  },
};

export function EmptyState({
  variant = "default",
  icon = "chart",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  showDemoHint = false,
}: EmptyStateProps) {
  const IconComponent = ICONS[icon];
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`rounded-2xl border ${styles.border} ${styles.bg} p-8 sm:p-12`}>
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-6`}>
          <IconComponent className={`h-8 w-8 ${styles.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {actionLabel && (actionHref || onAction) && (
            actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg shadow-sm transition-all hover:shadow-md"
              >
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg shadow-sm transition-all hover:shadow-md"
              >
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            )
          )}

          {secondaryActionLabel && secondaryActionHref && (
            <Link
              href={secondaryActionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-slate-700 dark:text-slate-300 font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {secondaryActionLabel}
            </Link>
          )}
        </div>

        {/* Demo Hint */}
        {showDemoHint && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 w-full">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              💡 <strong>Tip:</strong> Go to the{" "}
              <Link href="/dashboard" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Dashboard
              </Link>{" "}
              and click &quot;Generate Sample Data&quot; to see this feature in action.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

