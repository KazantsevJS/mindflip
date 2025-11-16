import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourcePath = join(
  __dirname,
  "..",
  "node_modules",
  "sql.js",
  "dist",
  "sql-wasm.wasm"
);
const destDir = join(__dirname, "..", "dist");
const destPath = join(destDir, "sql-wasm.wasm");

try {
  if (!existsSync(sourcePath)) {
    console.error(`Source WASM file not found: ${sourcePath}`);
    process.exit(1);
  }

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  copyFileSync(sourcePath, destPath);
  console.log(`WASM file copied to: ${destPath}`);
} catch (error) {
  console.error("Error copying WASM file:", error);
  process.exit(1);
}
