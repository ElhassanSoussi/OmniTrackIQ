/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Modern SaaS color palette (AgencyAnalytics-inspired)
      colors: {
        // Primary - Vibrant Blue
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Main primary
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // Accent - Purple
        accent: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // Main accent
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        // Success - Green
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Main success
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        // Warning - Amber
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Main warning
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Danger - Red
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444", // Main danger
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        // Brand (legacy support + new)
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Updated to match primary
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Light mode canvas/text colors
        gh: {
          canvas: "#ffffff",
          "canvas-default": "#ffffff",
          "canvas-subtle": "#f8fafc",
          "canvas-inset": "#f1f5f9",
          border: "#e2e8f0",
          "border-muted": "#f1f5f9",
          text: "#0f172a",
          "text-primary": "#0f172a",
          "text-secondary": "#475569",
          "text-tertiary": "#94a3b8",
          "text-muted": "#64748b",
          "text-subtle": "#94a3b8",
          link: "#0ea5e9",
        },
        // Dark mode canvas/text colors
        "gh-dark": {
          canvas: "#0f172a",
          "canvas-default": "#0f172a",
          "canvas-subtle": "#1e293b",
          "canvas-inset": "#020617",
          border: "#334155",
          "border-muted": "#1e293b",
          text: "#f8fafc",
          "text-primary": "#f8fafc",
          "text-secondary": "#cbd5e1",
          "text-tertiary": "#64748b",
          "text-muted": "#94a3b8",
          "text-subtle": "#64748b",
          link: "#38bdf8",
        },
        // Semantic aliases for dark mode
        "gh-text-primary-dark": "#f8fafc",
        "gh-text-secondary-dark": "#cbd5e1",
        "gh-text-tertiary-dark": "#64748b",
        "gh-link-dark": "#38bdf8",
        "gh-border-dark": "#334155",
        "gh-canvas-dark": "#0f172a",
        "gh-canvas-subtle-dark": "#1e293b",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          '"SF Mono"',
          "Menlo",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      fontSize: {
        // Modern typography scale
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.16" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
      },
      boxShadow: {
        // Modern shadows
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "DEFAULT": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        // Card shadows
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover": "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
        // Glow effects
        "glow-primary": "0 0 20px rgba(14, 165, 233, 0.3)",
        "glow-accent": "0 0 20px rgba(168, 85, 247, 0.3)",
        "glow-success": "0 0 20px rgba(16, 185, 129, 0.3)",
        // Legacy GitHub shadows
        "gh-sm": "0 1px 0 rgba(31, 35, 40, 0.04)",
        "gh": "0 1px 3px rgba(31, 35, 40, 0.12), 0 8px 24px rgba(66, 74, 83, 0.12)",
        "gh-lg": "0 8px 24px rgba(140, 149, 159, 0.2)",
        "gh-overlay": "0 1px 3px rgba(31, 35, 40, 0.12), 0 8px 24px rgba(66, 74, 83, 0.12)",
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.375rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        // Legacy
        "gh": "6px",
        "gh-lg": "12px",
      },
      backgroundImage: {
        // Gradient backgrounds
        "gradient-primary": "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
        "gradient-accent": "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
        "gradient-hero": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsla(210, 100%, 56%, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(270, 91%, 65%, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(210, 100%, 56%, 0.05) 0px, transparent 50%)",
        "gradient-card": "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
        "gradient-card-dark": "linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(30,41,59,0.4) 100%)",
      },
      animation: {
        // Micro-animations
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "fade-in-down": "fadeInDown 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "bounce-soft": "bounceSoft 1s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "gradient": "gradient 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem",
      },
    },
  },
  plugins: [],
};
