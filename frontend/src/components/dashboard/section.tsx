import { ReactNode } from "react";
import { Container } from "../marketing/container";

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
      <Container>
        <div className="flex flex-col gap-4">
          {(title || description || actions) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
                {description && <p className="text-sm text-slate-400">{description}</p>}
              </div>
              {actions}
            </div>
          )}
          {children}
        </div>
      </Container>
    </section>
  );
}
