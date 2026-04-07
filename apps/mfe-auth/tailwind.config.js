/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#fafafa",
          tertiary: "#f5f5f5",
          invert: "#0a0a0a",
        },
        border: {
          DEFAULT: "#e5e5e5",
          subtle: "#f0f0f0",
          strong: "#d4d4d4",
        },
        accent: {
          DEFAULT: "#171717",
          muted: "#525252",
          subtle: "#737373",
          faint: "#a3a3a3",
        },
        primary: {
          DEFAULT: "#171717",
          hover: "#262626",
          fg: "#ffffff",
        },
        info: {
          DEFAULT: "#2563eb",
          light: "#eff6ff",
          fg: "#1d4ed8",
        },
        success: {
          DEFAULT: "#16a34a",
          light: "#f0fdf4",
          fg: "#15803d",
        },
        warning: {
          DEFAULT: "#d97706",
          light: "#fffbeb",
          fg: "#b45309",
        },
        danger: {
          DEFAULT: "#dc2626",
          light: "#fef2f2",
          fg: "#b91c1c",
        },
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.03)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03)",
        panel: "0 0 0 1px rgb(0 0 0 / 0.03), 0 2px 4px rgb(0 0 0 / 0.02), 0 12px 24px rgb(0 0 0 / 0.04)",
      },
      animation: {
        "in": "animIn 0.2s ease-out",
        "in-slow": "animIn 0.35s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
      },
      keyframes: {
        animIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
