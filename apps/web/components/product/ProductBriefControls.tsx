"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

export function ProductBriefControls({
  product,
  onSaved
}: {
  product: Product;
  onSaved: (product: Product) => void;
}) {
  const [name, setName] = useState(product.name || "");
  const [category, setCategory] = useState(product.category || "");
  const [imageStylePreset, setImageStylePreset] = useState(
    product.imageStylePreset || product.style || "minimal studio"
  );
  const [targetMarket, setTargetMarket] = useState(product.targetMarket || "");
  const [tone, setTone] = useState(product.tone || "clear and trustworthy");
  const [seoKeywords, setSeoKeywords] = useState(product.seoKeywords.join(", "));
  const [language, setLanguage] = useState(product.language || "English");
  const [brandVoice, setBrandVoice] = useState(product.brandVoice || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(product.name || "");
    setCategory(product.category || "");
    setImageStylePreset(product.imageStylePreset || product.style || "minimal studio");
    setTargetMarket(product.targetMarket || "");
    setTone(product.tone || "clear and trustworthy");
    setSeoKeywords(product.seoKeywords.join(", "));
    setLanguage(product.language || "English");
    setBrandVoice(product.brandVoice || "");
  }, [
    product.id,
    product.name,
    product.category,
    product.style,
    product.imageStylePreset,
    product.targetMarket,
    product.tone,
    product.seoKeywords,
    product.language,
    product.brandVoice
  ]);

  async function save() {
    setIsSaving(true);
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category: category.trim(),
        style: imageStylePreset.trim(),
        imageStylePreset: imageStylePreset.trim(),
        targetMarket: targetMarket.trim(),
        tone: tone.trim(),
        seoKeywords: seoKeywords.split(",").map((item) => item.trim()).filter(Boolean),
        language: language.trim(),
        brandVoice: brandVoice.trim()
      })
    });
    const updated = await response.json();
    setIsSaving(false);
    if (response.ok) onSaved(updated);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Product name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
            placeholder="Product name"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
            placeholder="Category"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Image style preset</span>
          <select
            value={imageStylePreset}
            onChange={(event) => setImageStylePreset(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
          >
            <option>minimal studio</option>
            <option>modern home</option>
            <option>luxury product</option>
            <option>outdoor lifestyle</option>
            <option>streetwear editorial</option>
            <option>clean marketplace</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Target market</span>
          <input
            value={targetMarket}
            onChange={(event) => setTargetMarket(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
            placeholder="US home decor buyers"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Tone</span>
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
          >
            <option>clear and trustworthy</option>
            <option>premium and concise</option>
            <option>friendly and practical</option>
            <option>bold and trend-led</option>
            <option>minimal and editorial</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Language</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
          >
            <option>English</option>
            <option>Chinese</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">SEO keywords</span>
        <input
          value={seoKeywords}
          onChange={(event) => setSeoKeywords(event.target.value)}
          className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
          placeholder="comma, separated, buyer keywords"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Brand voice</span>
        <textarea
          value={brandVoice}
          onChange={(event) => setBrandVoice(event.target.value)}
          className="studio-focus mt-2 min-h-28 w-full rounded border border-line p-3"
          placeholder="Voice, claims policy, phrasing preferences"
        />
      </label>
      <button
        type="button"
        onClick={save}
        disabled={isSaving}
        className="studio-focus h-10 w-fit rounded bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save brief"}
      </button>
    </div>
  );
}
