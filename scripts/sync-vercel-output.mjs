import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(repoRoot, "apps/web/.next");
const destination = resolve(repoRoot, ".next");

if (!existsSync(source)) {
  throw new Error(`Expected Next.js build output at ${source}`);
}

rmSync(destination, { force: true, recursive: true });
cpSync(source, destination, { recursive: true });

console.log(`Synced Vercel output from ${source} to ${destination}`);
