// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // تنظیمات سفارشی (در صورت نیاز)
    },
  },
  plugins: [require("tailwindcss-rtl")],
};
