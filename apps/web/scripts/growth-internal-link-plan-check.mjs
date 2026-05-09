import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(appRoot, "lib/growth-internal-link-plan.ts");

assert.ok(fs.existsSync(sourcePath), "growth-internal-link-plan.ts should exist");

const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    strict: true
  }
});
const tempPath = path.join(os.tmpdir(), `growth-internal-link-plan-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, compiled.outputText);

const { buildGrowthInternalLinkPlan } = await import(`file://${tempPath}`);

const suggestion = {
  key: "product-collection-1-2",
  sourceId: "gid://shopify/Product/1",
  sourceType: "product",
  sourceTitle: "Blush Aurora Ring",
  targetTitle: "Gemstone Rings",
  targetUrl: "https://example.com/collections/gemstone-rings",
  linkType: "product_to_collection",
  anchorText: "Explore gemstone rings",
  reason: "Connect product to collection context.",
  priority: "high"
};

const plan = buildGrowthInternalLinkPlan({
  source: {
    id: "gid://shopify/Product/1",
    title: "Blush Aurora Ring",
    descriptionHtml: "<p>A rose-pink gemstone ring.</p>"
  },
  suggestion
});

assert.equal(plan.hasChanges, true);
assert.ok(plan.changes.descriptionHtml.includes("data-acestudio-internal-link"));
assert.ok(plan.changes.descriptionHtml.includes('href="https://example.com/collections/gemstone-rings"'));
assert.deepEqual(plan.summary, ["Internal link"]);
assert.equal(plan.diff[0].changed, true);

const alreadyLinkedPlan = buildGrowthInternalLinkPlan({
  source: {
    id: "gid://shopify/Product/1",
    title: "Blush Aurora Ring",
    descriptionHtml: '<p>See <a href="https://example.com/collections/gemstone-rings">gemstone rings</a>.</p>'
  },
  suggestion
});

assert.equal(alreadyLinkedPlan.hasChanges, false);
assert.equal(alreadyLinkedPlan.changes.descriptionHtml, undefined);

const unsafePlan = buildGrowthInternalLinkPlan({
  source: {
    id: "gid://shopify/Product/1",
    title: "Blush Aurora Ring",
    descriptionHtml: "<p>A rose-pink gemstone ring.</p>"
  },
  suggestion: {
    ...suggestion,
    targetUrl: "javascript:alert(1)"
  }
});

assert.equal(unsafePlan.hasChanges, false);
assert.equal(unsafePlan.reason, "Invalid internal link target URL.");

fs.rmSync(tempPath, { force: true });
console.log("growth internal link plan checks passed");
