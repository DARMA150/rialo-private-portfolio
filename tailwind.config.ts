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
        background: "#0a0a0f",
        surface: "#121218",
        surfaceMuted: "#161622",
        borderDark: "#1f1f28",
        borderMuted: "#2d2d3d",
        textPrimary: "#f1f1f1",
        textSecondary: "#888888",
        gain: "#22c55e",
        loss: "#f87171",
        accentViolet: "#8b5cf6",
        accentEmerald: "#10b981",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
