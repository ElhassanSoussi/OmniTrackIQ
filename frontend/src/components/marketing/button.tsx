import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ href, variant = "primary", size = "md", className = "", children, ...buttonProps }: ButtonProps) {
  // GitHub-inspired button styles
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
  
  const sizes: Record<string, string> = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-[5px] text-sm",
    lg: "px-5 py-2 text-base",
  };

  const variants: Record<Variant, string> = {
    primary: "bg-[#238636] text-white border border-[#238636] hover:bg-[#2ea043] hover:border-[#2ea043]",
    secondary: "bg-[#f6f8fa] text-[#24292f] border border-[#d0d7de] hover:bg-[#f3f4f6] hover:border-[#1b1f2326] dark:bg-[#21262d] dark:text-[#c9d1d9] dark:border-[#30363d] dark:hover:bg-[#30363d]",
    ghost: "bg-transparent text-[#0969da] border border-transparent hover:bg-[#f6f8fa] dark:text-[#58a6ff] dark:hover:bg-[#21262d]",
    outline: "bg-transparent text-[#24292f] border border-[#d0d7de] hover:bg-[#f6f8fa] dark:text-[#c9d1d9] dark:border-[#30363d] dark:hover:bg-[#21262d]",
  };

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

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
