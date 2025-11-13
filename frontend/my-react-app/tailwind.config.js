/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "rawgly",
          "Montserrat",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#fff7eb",
          100: "#fdeacc",
          200: "#f8d394",
          300: "#f2b55a",
          400: "#ea9634",
          500: "#d27a18",
          600: "#b25f12",
          700: "#8c480f",
          800: "#6d390f",
          900: "#5a3010",
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
