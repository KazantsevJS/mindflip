import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ["electron", "fs", "path", "util", "module"],
    },
  },
  optimizeDeps: {
    exclude: ["electron", "fs", "path", "util", "module"],
  },
  define: {
    global: "globalThis",
  },
});
