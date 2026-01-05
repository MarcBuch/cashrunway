import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        danger: {
          DEFAULT: "#dc2626",
          dark: "#b91c1c",
        },
        warning: {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
        },
        safe: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
      },
      animation: {
        "flash-red": "flash-red 1s ease-in-out infinite",
      },
      keyframes: {
        "flash-red": {
          "0%, 100%": { backgroundColor: "#dc2626", opacity: "1" },
          "50%": { backgroundColor: "#ef4444", opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
