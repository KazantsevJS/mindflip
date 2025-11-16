import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Плагин для перехвата попыток импортировать Node.js модули
    {
      name: "exclude-node-modules",
      resolveId(id) {
        // Исключаем Node.js модули из обработки
        if (
          id === "fs" ||
          id === "path" ||
          id === "electron" ||
          id === "util" ||
          id === "module" ||
          id.startsWith("node:")
        ) {
          return `\0virtual:${id}`;
        }
        return null;
      },
      load(id) {
        // Если кто-то пытается загрузить эти модули, возвращаем пустой модуль с правильным синтаксисом
        if (
          id === "\0virtual:fs" ||
          id === "\0virtual:path" ||
          id === "\0virtual:electron" ||
          id === "\0virtual:util" ||
          id === "\0virtual:module"
        ) {
          // Возвращаем модуль, который не будет вызывать ошибок
          return `export default {};`;
        }
        if (id.startsWith("\0virtual:node:")) {
          return `export default {};`;
        }
        return null;
      },
      transform(code, id) {
        const nodeModules = ["fs", "path", "electron", "util", "module"];
        let modified = code;
        for (const mod of nodeModules) {
          const importDefaultRegex = new RegExp(
            `import\\s+([^\\s]+)\\s+from\\s+["']${mod}["']`,
            "g"
          );
          const importAllRegex = new RegExp(
            `import\\s+\\*\\s+as\\s+([^\\s]+)\\s+from\\s+["']${mod}["']`,
            "g"
          );
          const importNamedRegex = new RegExp(
            `import\\s+\\{([^}]+)\\}\s+from\\s+["']${mod}["']`,
            "g"
          );

          modified = modified.replace(importDefaultRegex, `const $1 = {};`);
          modified = modified.replace(importAllRegex, `const $1 = {};`);
          modified = modified.replace(importNamedRegex, `const $1 = {};`);

          const dynamicImportRegex = new RegExp(
            `import\\(["']${mod}["']\\)`,
            "g"
          );
          modified = modified.replace(
            dynamicImportRegex,
            `Promise.resolve({})`
          );
        }
        if (modified !== code) {
          return { code: modified, map: null };
        }
        return null;
      },
      renderChunk(code, chunk) {
        const nodeModules = ["fs", "path", "electron", "util", "module"];
        let modified = code;
        for (const mod of nodeModules) {
          const importDefaultRegex = new RegExp(
            `import\\s+([^\\s]+)\\s+from\\s+["']${mod}["']`,
            "g"
          );
          const importAllRegex = new RegExp(
            `import\\s+\\*\\s+as\\s+([^\\s]+)\\s+from\\s+["']${mod}["']`,
            "g"
          );
          const importNamedRegex = new RegExp(
            `import\\s+\\{([^}]+)\\}\s+from\\s+["']${mod}["']`,
            "g"
          );
          const importSideEffectRegex = new RegExp(
            `import\\s+["']${mod}["']`,
            "g"
          );

          modified = modified.replace(importDefaultRegex, `const $1 = {};`);
          modified = modified.replace(importAllRegex, `const $1 = {};`);
          modified = modified.replace(importNamedRegex, ``);
          modified = modified.replace(importSideEffectRegex, ``);

          const dynamicImportRegex = new RegExp(
            `import\\(["']${mod}["']\\)`,
            "g"
          );
          modified = modified.replace(
            dynamicImportRegex,
            `Promise.resolve({})`
          );
        }
        if (modified !== code) {
          return { code: modified, map: null };
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: (id) => {
        // Исключаем все Node.js модули
        return (
          id === "fs" ||
          id === "path" ||
          id === "electron" ||
          id === "util" ||
          id === "module" ||
          id.startsWith("node:") ||
          id.startsWith("electron")
        );
      },
      output: {
        // Убеждаемся что Node.js модули не включаются в бандл
        externalLiveBindings: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ["electron", "fs", "path", "util", "module"],
  },
  define: {
    global: "globalThis",
  },
});
