import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const appRoot = path.resolve(import.meta.dirname, "..");
const dictionariesPath = path.join(appRoot, "lib/i18n/dictionaries.ts");
const growthPagePath = path.join(appRoot, "app/growth/page.tsx");
const growthApplyPath = path.join(appRoot, "components/growth/GrowthApplyButton.tsx");
const imageAltApplyPath = path.join(appRoot, "components/growth/GrowthImageAltApplyButton.tsx");
const internalLinkApplyPath = path.join(appRoot, "components/growth/GrowthInternalLinkApplyButton.tsx");
const rewriteApplyPath = path.join(appRoot, "components/growth/SearchConsoleRewriteApplyButton.tsx");

for (const filePath of [dictionariesPath, growthPagePath, growthApplyPath, imageAltApplyPath, internalLinkApplyPath, rewriteApplyPath]) {
  assert.ok(fs.existsSync(filePath), `${path.relative(appRoot, filePath)} should exist`);
}

const dictionarySource = fs.readFileSync(dictionariesPath, "utf8");
const compiled = ts.transpileModule(dictionarySource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    strict: true
  }
});
const tempPath = path.join(os.tmpdir(), `growth-i18n-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, compiled.outputText);
const { dictionaries } = await import(`file://${tempPath}`);

const growthEn = dictionaries.en.growthPage;
const growthZh = dictionaries.zh.growthPage;

assert.ok(growthEn?.hero?.title, "English Growth page hero copy should be structured");
assert.ok(growthZh?.hero?.title, "Chinese Growth page hero copy should be structured");
assert.notEqual(growthEn.hero.title, growthZh.hero.title, "Growth page hero title should be translated");
assert.match(growthZh.hero.title, /[\u3400-\u9fff]/, "Chinese Growth page copy should contain Chinese characters");
assert.equal(growthEn.workflow.stages.length, 4, "Growth workflow should have four translated stages");
assert.equal(growthZh.workflow.stages.length, growthEn.workflow.stages.length, "Chinese workflow should mirror English workflow");
assert.equal(growthEn.skillCoverage.items.length, 8, "Growth skill coverage should expose eight pillars");
assert.equal(growthZh.skillCoverage.items.length, growthEn.skillCoverage.items.length, "Chinese skill coverage should mirror English skill coverage");
assert.equal(
  growthEn.optimizationWriter.collectionFields.length,
  growthZh.optimizationWriter.collectionFields.length,
  "Collection write-back field badges should be translated"
);
assert.ok(growthEn.writeBackPreview?.after, "Growth write-back preview copy should include editable After label");
assert.notEqual(growthEn.writeBackPreview.after, growthZh.writeBackPreview.after, "Write-back preview labels should be translated");
assert.equal(growthEn.writeBackPreview.before, "Before", "English write-back preview should use English labels");
assert.equal(growthZh.writeBackPreview.before, "优化前", "Chinese write-back preview should use Chinese labels");
assert.ok(growthEn.writeBackPreview.selectedCollection, "Collection write-back copy should be structured");
assert.notEqual(
  growthEn.writeBackPreview.previewCollectionWriteBack,
  growthZh.writeBackPreview.previewCollectionWriteBack,
  "Collection write-back action should be translated"
);
assert.ok(growthEn.writeBackPreview.imageAlt?.preview, "Image alt write-back copy should be structured");
assert.notEqual(
  growthEn.writeBackPreview.imageAlt.preview,
  growthZh.writeBackPreview.imageAlt.preview,
  "Image alt write-back action should be translated"
);
assert.ok(growthEn.writeBackPreview.internalLink?.preview, "Internal link write-back copy should be structured");
assert.notEqual(
  growthEn.writeBackPreview.internalLink.preview,
  growthZh.writeBackPreview.internalLink.preview,
  "Internal link write-back action should be translated"
);

const growthPageSource = fs.readFileSync(growthPagePath, "utf8");
assert.ok(
  growthPageSource.includes("getServerDictionary") && growthPageSource.includes("growthPage"),
  "Growth page should read Growth copy from the server dictionary"
);
assert.ok(
  !growthPageSource.includes("Do the SEO/GEO work, not just score it"),
  "Growth page should not keep the optimization writer heading hard-coded"
);

const growthApplySource = fs.readFileSync(growthApplyPath, "utf8");
assert.ok(
  growthApplySource.includes("useLanguage") && growthApplySource.includes("writeBackPreview"),
  "GrowthApplyButton should use translated write-back copy"
);

const rewriteApplySource = fs.readFileSync(rewriteApplyPath, "utf8");
assert.ok(
  rewriteApplySource.includes("useLanguage") && rewriteApplySource.includes("writeBackPreview"),
  "SearchConsoleRewriteApplyButton should use translated write-back copy"
);

const imageAltApplySource = fs.readFileSync(imageAltApplyPath, "utf8");
assert.ok(
  imageAltApplySource.includes("useLanguage") && imageAltApplySource.includes("imageAlt"),
  "GrowthImageAltApplyButton should use translated image alt copy"
);

const internalLinkApplySource = fs.readFileSync(internalLinkApplyPath, "utf8");
assert.ok(
  internalLinkApplySource.includes("useLanguage") && internalLinkApplySource.includes("internalLink"),
  "GrowthInternalLinkApplyButton should use translated internal link copy"
);

fs.rmSync(tempPath, { force: true });
console.log("growth i18n checks passed");
