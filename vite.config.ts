import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tauri 期望固定的端口，并使用 Vite 的开发服务器
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  // 为 Tauri 构建产生的环境变量
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri 在桌面应用中使用 Chromium，目标较新，可使用 esbuild 进行优化
    target: "es2021",
    minify: "esbuild",
    sourcemap: false,
  },
});
