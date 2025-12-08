"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  // Apply theme to document
  const applyTheme = (resolved: "light" | "dark") => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    setResolvedTheme(resolved);
  };

  // Set theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
    
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    applyTheme(resolved);
  };

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    
    // Get stored theme or default to system
    const stored = localStorage.getItem("theme") as Theme | null;
    const initialTheme = stored || "system";
    
    setThemeState(initialTheme);
    const resolved = initialTheme === "system" ? getSystemTheme() : initialTheme;
    applyTheme(resolved);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentTheme = localStorage.getItem("theme") as Theme | null;
      if (!currentTheme || currentTheme === "system") {
        applyTheme(getSystemTheme());
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Prevent flash on initial load
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
