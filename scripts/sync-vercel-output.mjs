import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("apps/web/.next");
const destination = resolve(".next");

if (!existsSync(source)) {
  throw new Error(`Expected Next.js build output at ${source}`);
}

rmSync(destination, { force: true, recursive: true });
cpSync(source, destination, { recursive: true });

console.log(`Synced Vercel output from ${source} to ${destination}`);
