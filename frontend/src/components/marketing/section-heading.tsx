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
        <span className="inline-flex items-center rounded-full border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#21262d] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#57606a] dark:text-[#8b949e]">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold text-[#1f2328] dark:text-[#e6edf3] md:text-4xl tracking-tight">{title}</h2>
      {subtitle && <p className="max-w-2xl text-base text-[#57606a] dark:text-[#8b949e]">{subtitle}</p>}
    </div>
  );
}
