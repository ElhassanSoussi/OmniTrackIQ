import { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, subtitle, align = "left" }: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
          {eyebrow}
        </span>
      )}
      <div className="text-3xl font-semibold text-white md:text-4xl">{title}</div>
      {subtitle && <div className="max-w-2xl text-base text-slate-300">{subtitle}</div>}
    </div>
  );
}
