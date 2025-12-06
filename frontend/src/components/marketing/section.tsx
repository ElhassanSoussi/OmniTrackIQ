import { ReactNode } from "react";
import { Container } from "./container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  bordered?: boolean;
}

export function Section({ children, className = "", id, bordered = false }: SectionProps) {
  return (
    <section id={id} className={bordered ? "border-t border-white/5" : ""}>
      <Container className={`py-16 md:py-20 ${className}`}>{children}</Container>
    </section>
  );
}
