import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(appRoot, "lib/growth-fix-plan.ts");

assert.ok(fs.existsSync(sourcePath), "growth-fix-plan.ts should exist");

const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    strict: true
  }
});
const tempPath = path.join(os.tmpdir(), `growth-fix-plan-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, compiled.outputText);

const { buildGrowthFixPlan } = await import(`file://${tempPath}`);

const product = {
  id: "gid://shopify/Product/123",
  title: "BLUSH AURORA RING",
  seoTitle: "Old SEO title",
  seoDescription: "",
  tags: ["ring"],
  descriptionHtml: "<p>A bright rose-pink gemstone.</p>"
};
const suggestedFix = {
  seoTitle: "Blush Aurora Ring for Rose Pink Jewelry Buyers",
  seoDescription: "Discover the blush aurora ring with rose-pink sparkle, gift-ready styling, photos, and buying details.",
  tags: ["ring", "rose pink ring", "gift jewelry"],
  descriptionAppendHtml: "<section><h3>Product details for search and AI discovery</h3><p>Rose pink jewelry facts.</p></section>"
};

const fullPlan = buildGrowthFixPlan({ product, suggestedFix });
assert.equal(fullPlan.hasChanges, true);
assert.equal(fullPlan.changes.seo.title, suggestedFix.seoTitle);
assert.equal(fullPlan.changes.seo.description, suggestedFix.seoDescription);
assert.deepEqual(fullPlan.changes.tags, suggestedFix.tags);
assert.ok(fullPlan.changes.descriptionHtml.includes("Product details for search and AI discovery"));

const selectedPlan = buildGrowthFixPlan({
  product,
  suggestedFix,
  selectedFields: ["tags"]
});
assert.equal(selectedPlan.hasChanges, true);
assert.equal(selectedPlan.changes.seo, undefined);
assert.deepEqual(selectedPlan.changes.tags, suggestedFix.tags);
assert.equal(selectedPlan.changes.descriptionHtml, undefined);
assert.deepEqual(selectedPlan.summary, ["Product tags / keywords"]);

const overridePlan = buildGrowthFixPlan({
  product,
  suggestedFix,
  selectedFields: ["seo.title", "tags"],
  overrides: {
    seoTitle: "Custom rose ring title",
    tags: ["custom tag", "rose pink ring", "custom tag"]
  }
});
assert.equal(overridePlan.changes.seo.title, "Custom rose ring title");
assert.deepEqual(overridePlan.changes.tags, ["custom tag", "rose pink ring"]);
assert.deepEqual(overridePlan.summary, ["SEO title", "Product tags / keywords"]);

const editedDescriptionPlan = buildGrowthFixPlan({
  product,
  suggestedFix,
  selectedFields: ["seo.description"],
  overrides: {
    seoDescription: "Custom meta description written by the merchant for rose pink ring searches."
  }
});
assert.equal(
  editedDescriptionPlan.changes.seo.description,
  "Custom meta description written by the merchant for rose pink ring searches."
);
assert.deepEqual(editedDescriptionPlan.summary, ["Meta description"]);

const editedAnswerPlan = buildGrowthFixPlan({
  product,
  suggestedFix,
  selectedFields: ["descriptionHtml"],
  overrides: {
    descriptionAppendText: "Custom buyer answer text written safely before Shopify write-back."
  }
});
assert.ok(editedAnswerPlan.changes.descriptionHtml.includes("Product details for search and AI discovery"));
assert.ok(editedAnswerPlan.changes.descriptionHtml.includes("Custom buyer answer text written safely"));
assert.ok(editedAnswerPlan.diff.some((entry) => entry.field === "descriptionHtml" && entry.after.includes("Custom buyer answer text")));

const noSelectionPlan = buildGrowthFixPlan({
  product,
  suggestedFix,
  selectedFields: []
});
assert.equal(noSelectionPlan.hasChanges, false);
assert.deepEqual(noSelectionPlan.summary, []);

fs.rmSync(tempPath, { force: true });
console.log("growth fix plan checks passed");
