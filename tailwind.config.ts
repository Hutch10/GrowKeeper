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
            DEFAULT: "#2D5A27",
            light: "#4A8A3F",
            dark: "#1A3617",
            sage: "#84A59D",
            forest: "#1B3A1C",
          },
          pink: {
            DEFAULT: "#FADADD",
            light: "#FFF0F1",
            dark: "#E8B9BD",
            soft: "#F9EBEC",
          },
          dark: "#1A1F1A",
          warm: "#FFF9F9",
          cream: "#F9F7F5",
          clay: "#9B7653",
        },
      },
    },
  },
  plugins: [],
};
export default config;
