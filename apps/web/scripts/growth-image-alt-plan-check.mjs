import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(appRoot, "lib/growth-image-alt-plan.ts");

assert.ok(fs.existsSync(sourcePath), "growth-image-alt-plan.ts should exist");

const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    strict: true
  }
});
const tempPath = path.join(os.tmpdir(), `growth-image-alt-plan-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, compiled.outputText);

const { buildGrowthImageAltPlan } = await import(`file://${tempPath}`);

const plan = buildGrowthImageAltPlan({
  product: {
    id: "gid://shopify/Product/123",
    title: "Blush Aurora Ring",
    productType: "Rings",
    tags: ["rose pink ring", "gift jewelry"],
    media: [
      {
        id: "gid://shopify/MediaImage/1",
        url: "https://cdn.shopify.com/ring-front.jpg",
        alt: ""
      },
      {
        id: "gid://shopify/MediaImage/2",
        url: "https://cdn.shopify.com/ring-detail.jpg",
        alt: "IMG_1234"
      },
      {
        id: "gid://shopify/MediaImage/3",
        url: "https://cdn.shopify.com/ring-lifestyle.jpg",
        alt: "Blush Aurora Ring on hand"
      }
    ]
  }
});

assert.equal(plan.hasChanges, true);
assert.equal(plan.mediaUpdates.length, 2);
assert.equal(plan.diff.length, 2);
assert.ok(plan.mediaUpdates[0].alt.includes("Blush Aurora Ring"));
assert.ok(plan.mediaUpdates[0].alt.length <= 125);
assert.ok(plan.diff.every((entry) => entry.changed));
assert.deepEqual(plan.summary, ["2 image alt text updates"]);

const noChangePlan = buildGrowthImageAltPlan({
  product: {
    id: "gid://shopify/Product/123",
    title: "Blush Aurora Ring",
    tags: [],
    media: [
      {
        id: "gid://shopify/MediaImage/3",
        url: "https://cdn.shopify.com/ring-lifestyle.jpg",
        alt: "Blush Aurora Ring on hand with rose pink gemstone detail"
      }
    ]
  }
});

assert.equal(noChangePlan.hasChanges, false);
assert.deepEqual(noChangePlan.mediaUpdates, []);

fs.rmSync(tempPath, { force: true });
console.log("growth image alt plan checks passed");
