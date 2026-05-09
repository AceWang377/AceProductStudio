import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(appRoot, "lib/growth-rewrite-plan.ts");

assert.ok(fs.existsSync(sourcePath), "growth-rewrite-plan.ts should exist");

const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    strict: true
  }
});
const tempPath = path.join(os.tmpdir(), `growth-rewrite-plan-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, compiled.outputText);

const { buildGrowthRewritePlan } = await import(`file://${tempPath}`);

const rewrite = {
  seoTitle: "Blush Aurora Ring for Rose Pink Jewelry Buyers",
  seoDescription: "Discover the blush aurora ring with rose-pink sparkle, gift-ready styling, photos, and buying details before choosing your size.",
  faqQuestion: "Is the blush aurora ring good for gifts?",
  answerBlock: "The blush aurora ring is built for rose-pink jewelry shoppers who want gift-ready sparkle, product photos, and clear sizing context.",
  intent: "commercial",
  confidence: "high"
};

const firstPlan = buildGrowthRewritePlan({
  product: {
    id: "gid://shopify/Product/123",
    title: "BLUSH AURORA RING",
    seoTitle: "Old title",
    seoDescription: "Old description",
    descriptionHtml: "<p>A bright rose-pink gemstone.</p>"
  },
  rewrite
});

assert.equal(firstPlan.hasChanges, true);
assert.equal(firstPlan.changes.seo?.title, rewrite.seoTitle);
assert.equal(firstPlan.changes.seo?.description, rewrite.seoDescription);
assert.ok(firstPlan.changes.descriptionHtml.includes("data-acestudio-growth-rewrite"));
assert.ok(firstPlan.diff.some((entry) => entry.field === "seo.title" && entry.before === "Old title" && entry.after === rewrite.seoTitle));
assert.ok(firstPlan.diff.some((entry) => entry.field === "descriptionHtml" && entry.changed));

const secondPlan = buildGrowthRewritePlan({
  product: {
    id: "gid://shopify/Product/123",
    title: "BLUSH AURORA RING",
    seoTitle: rewrite.seoTitle,
    seoDescription: rewrite.seoDescription,
    descriptionHtml: firstPlan.changes.descriptionHtml
  },
  rewrite
});

assert.equal(secondPlan.hasChanges, false);
assert.equal(secondPlan.changes.descriptionHtml, undefined);
assert.ok(secondPlan.diff.every((entry) => !entry.changed));

fs.rmSync(tempPath, { force: true });
console.log("growth rewrite plan checks passed");
