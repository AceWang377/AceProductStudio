import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const source = readFileSync(join(root, "lib", "qa-suite.ts"), "utf8");

const requiredStepIds = [
  "register-email",
  "google-login",
  "connect-shopify",
  "upload-product-image",
  "generate-images",
  "generate-copy",
  "publish-shopify-draft",
  "buy-credits",
  "growth-scan",
  "growth-write-back"
];

const requiredPaths = [
  "/login",
  "/settings/shopify",
  "/products/new",
  "/billing",
  "/growth"
];

for (const id of requiredStepIds) {
  if (!source.includes(`id: "${id}"`)) {
    throw new Error(`Missing QA step id: ${id}`);
  }
}

for (const path of requiredPaths) {
  if (!source.includes(`href: "${path}"`)) {
    throw new Error(`Missing QA link: ${path}`);
  }
}

console.log(`QA suite covers ${requiredStepIds.length} required real-user steps.`);
