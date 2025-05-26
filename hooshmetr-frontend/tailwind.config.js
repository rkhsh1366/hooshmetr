/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1fe",
          100: "#cce3fd",
          200: "#99c7fb",
          300: "#66aaf9",
          400: "#338ef7",
          500: "#0072f5", // اصلی
          600: "#005bc4",
          700: "#004493",
          800: "#002e62",
          900: "#001731",
        },
        secondary: {
          50: "#f2f2f2",
          100: "#e6e6e6",
          200: "#cccccc",
          300: "#b3b3b3",
          400: "#999999",
          500: "#808080", // اصلی
          600: "#666666",
          700: "#4d4d4d",
          800: "#333333",
          900: "#1a1a1a",
        },
        success: {
          50: "#e6f9f1",
          100: "#ccf3e4",
          200: "#99e7c8",
          300: "#66dbad",
          400: "#33cf91",
          500: "#00c376", // اصلی
          600: "#009c5e",
          700: "#007547",
          800: "#004e2f",
          900: "#002718",
        },
        danger: {
          50: "#fee6e6",
          100: "#fdcccc",
          200: "#fb9999",
          300: "#f96666",
          400: "#f73333",
          500: "#f50000", // اصلی
          600: "#c40000",
          700: "#930000",
          800: "#620000",
          900: "#310000",
        },
        warning: {
          50: "#fff8e6",
          100: "#fff1cc",
          200: "#ffe399",
          300: "#ffd666",
          400: "#ffc833",
          500: "#ffbb00", // اصلی
          600: "#cc9500",
          700: "#997000",
          800: "#664a00",
          900: "#332500",
        },
      },
      fontFamily: {
        sans: ["Vazirmatn", "sans-serif"],
      },
      fontSize: {
        "2xs": "0.625rem",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
  ],
};
