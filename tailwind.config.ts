import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        rust: {
          50: "#fff4ed",
          100: "#ffe6d5",
          200: "#feccaa",
          300: "#fda674",
          400: "#fb7c3c",
          500: "#f95816",
          600: "#ea3f0c",
          700: "#c22f0c",
          800: "#9a2812",
          900: "#7c2412",
        },
      },
    },
  },
  plugins: [],
};
export default config;
