import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(appRoot, "lib/growth-collection-fix-plan.ts");

assert.ok(fs.existsSync(sourcePath), "growth-collection-fix-plan.ts should exist");

const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    strict: true
  }
});
const tempPath = path.join(os.tmpdir(), `growth-collection-fix-plan-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, compiled.outputText);

const { buildGrowthCollectionFixPlan } = await import(`file://${tempPath}`);

const collection = {
  id: "gid://shopify/Collection/456",
  title: "Rings",
  seoTitle: "Old collection title",
  seoDescription: "",
  descriptionHtml: "<p>Shop our rings.</p>"
};
const suggestedFix = {
  seoTitle: "Gemstone Rings Collection for Gift-Ready Jewelry",
  seoDescription: "Shop gemstone rings with gift-ready details, styling guidance, and easy ways to compare color, cut, and occasion.",
  tags: ["gemstone rings"],
  descriptionAppendHtml:
    "<section><h3>Collection guide for search and AI discovery</h3><p>Compare gemstone rings by color, cut, occasion, and gift intent.</p></section>"
};

const fullPlan = buildGrowthCollectionFixPlan({ collection, suggestedFix });
assert.equal(fullPlan.hasChanges, true);
assert.equal(fullPlan.changes.seo.title, suggestedFix.seoTitle);
assert.equal(fullPlan.changes.seo.description, suggestedFix.seoDescription);
assert.ok(fullPlan.changes.descriptionHtml.includes("Collection guide for search and AI discovery"));
assert.deepEqual(fullPlan.summary, ["Collection SEO title", "Collection meta description", "Collection buying guide"]);

const selectedPlan = buildGrowthCollectionFixPlan({
  collection,
  suggestedFix,
  selectedFields: ["seo.description"]
});
assert.equal(selectedPlan.changes.seo.description, suggestedFix.seoDescription);
assert.equal(selectedPlan.changes.descriptionHtml, undefined);
assert.deepEqual(selectedPlan.summary, ["Collection meta description"]);

const overridePlan = buildGrowthCollectionFixPlan({
  collection,
  suggestedFix,
  selectedFields: ["seo.title", "descriptionHtml"],
  overrides: {
    seoTitle: "Custom collection SEO title",
    descriptionAppendText: "Custom collection buyer guide text approved by the merchant."
  }
});
assert.equal(overridePlan.changes.seo.title, "Custom collection SEO title");
assert.ok(overridePlan.changes.descriptionHtml.includes("Custom collection buyer guide text"));
assert.deepEqual(overridePlan.summary, ["Collection SEO title", "Collection buying guide"]);

const alreadyAppliedPlan = buildGrowthCollectionFixPlan({
  collection: {
    ...collection,
    descriptionHtml: collection.descriptionHtml + suggestedFix.descriptionAppendHtml
  },
  suggestedFix,
  selectedFields: ["descriptionHtml"]
});
assert.equal(alreadyAppliedPlan.hasChanges, false);
assert.equal(alreadyAppliedPlan.changes.descriptionHtml, undefined);

fs.rmSync(tempPath, { force: true });
console.log("growth collection fix plan checks passed");
