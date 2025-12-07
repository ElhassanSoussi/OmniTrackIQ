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
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
  const variants: Record<Variant, string> = {
    primary: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
    secondary: "border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 bg-white",
    ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200",
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
