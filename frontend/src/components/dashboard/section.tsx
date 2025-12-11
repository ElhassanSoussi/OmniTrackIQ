import { ReactNode } from "react";

interface DashboardSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({ title, description, actions, children, className = "" }: DashboardSectionProps) {
  return (
    <section className={className}>
      <div className="flex flex-col gap-4 sm:gap-5">
        {(title || description || actions) && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-0.5 sm:space-y-1">
              {title && <h2 className="text-lg sm:text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">{title}</h2>}
              {description && <p className="text-xs sm:text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
