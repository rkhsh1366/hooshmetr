import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0", // ⭐ اضافه‌شده: اجرا روی همه آی‌پی‌ها
    port: 5173, // (می‌تونی عوضش هم بکنی مثلاً 5174)
    proxy: {
      "/api": {
        target: "http://localhost:8000", // آدرس بک‌اند جنگو
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
