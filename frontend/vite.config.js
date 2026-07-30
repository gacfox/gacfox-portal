import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  plugins: [react(), tailwindcss({ darkMode: "class" })],
  server: {
    proxy: {
      // 开发环境下将 API 与上传文件请求代理到 Go 服务
      "/api": "http://localhost:8080",
      "/uploads": "http://localhost:8080",
    },
  },
});
