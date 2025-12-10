import { ReactNode } from "react";
import { Container } from "./container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  bordered?: boolean;
  subtle?: boolean;
}

export function Section({ children, className = "", id, bordered = false, subtle = false }: SectionProps) {
  return (
    <section 
      id={id} 
      className={`${bordered ? "border-t border-[#d0d7de] dark:border-[#30363d]" : ""} ${subtle ? "bg-[#f6f8fa] dark:bg-[#161b22]" : ""}`}
    >
      <Container className={`py-16 md:py-20 ${className}`}>{children}</Container>
    </section>
  );
}
