"use client";

import { useThemeContext } from "@/components/providers/theme-provider";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  
  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
  };
}
