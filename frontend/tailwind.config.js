/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // GitHub-inspired color palette
      colors: {
        // GitHub brand green (replacing emerald)
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#238636", // GitHub green
          600: "#2ea043", // GitHub green hover
          700: "#238636",
          800: "#166534",
          900: "#14532d",
        },
        // GitHub gray scale
        gh: {
          canvas: "#ffffff",
          "canvas-subtle": "#f6f8fa",
          "canvas-inset": "#f6f8fa",
          border: "#d0d7de",
          "border-muted": "#d8dee4",
          text: "#1f2328",
          "text-muted": "#656d76",
          "text-subtle": "#6e7781",
        },
        // Dark mode colors
        "gh-dark": {
          canvas: "#0d1117",
          "canvas-subtle": "#161b22",
          "canvas-inset": "#010409",
          border: "#30363d",
          "border-muted": "#21262d",
          text: "#e6edf3",
          "text-muted": "#7d8590",
          "text-subtle": "#6e7681",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Noto Sans"',
          "Helvetica",
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: [
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
        // GitHub typography scale
        xs: ["12px", { lineHeight: "18px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["20px", { lineHeight: "28px" }],
        xl: ["24px", { lineHeight: "32px" }],
        "2xl": ["32px", { lineHeight: "40px" }],
        "3xl": ["40px", { lineHeight: "48px" }],
        "4xl": ["48px", { lineHeight: "56px" }],
      },
      boxShadow: {
        // GitHub shadows
        "gh-sm": "0 1px 0 rgba(31, 35, 40, 0.04)",
        gh: "0 1px 3px rgba(31, 35, 40, 0.12), 0 8px 24px rgba(66, 74, 83, 0.12)",
        "gh-lg": "0 8px 24px rgba(140, 149, 159, 0.2)",
        "gh-overlay": "0 1px 3px rgba(31, 35, 40, 0.12), 0 8px 24px rgba(66, 74, 83, 0.12)",
      },
      borderRadius: {
        // GitHub border radius
        gh: "6px",
        "gh-lg": "12px",
      },
    },
  },
  plugins: [],
};
