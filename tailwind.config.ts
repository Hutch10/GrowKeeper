import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          green: {
            DEFAULT: "#10B981", // Vibrant Emerald
            light: "#34D399",
            dark: "#065F46",
            sage: "#A7F3D0",
            forest: "#064E3B",
          },
          pink: {
            DEFAULT: "#EC4899", // Vibrant Magenta/Pink
            light: "#F9A8D4",
            dark: "#9D174D",
            soft: "#FDF2F8",
          },
          dark: "#0F172A", // Softer slate dark
          warm: "#FDF2F8", // Pinkish white for light mode hints
          cream: "#F9F7F5",
          clay: "#9B7653",
        },
      },
    },
  },
  plugins: [],
};
export default config;
