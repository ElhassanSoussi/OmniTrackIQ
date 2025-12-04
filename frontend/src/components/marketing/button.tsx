import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ href, variant = "primary", className = "", children, ...buttonProps }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";
  const variants: Record<Variant, string> = {
    primary: "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400",
    secondary: "border border-slate-700 text-slate-100 hover:border-slate-500 hover:text-white",
    ghost: "bg-white/5 text-slate-100 hover:bg-white/10",
  };
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
