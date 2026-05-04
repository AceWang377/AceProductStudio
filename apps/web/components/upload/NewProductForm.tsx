"use client";

import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { briefPresets, imageStyleOptions, toneOptions, type BriefPreset } from "@/lib/brief-presets";

export function NewProductForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [tone, setTone] = useState("clear and trustworthy");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [language, setLanguage] = useState("English");
  const [brandVoice, setBrandVoice] = useState("");
  const [imageStylePreset, setImageStylePreset] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileLabel = useMemo(() => {
    if (!file) return "PNG, JPEG, or WebP up to 10MB";
    return `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }, [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFileChange(nextFile: File | null) {
    setFile(nextFile);
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    if (!nextFile) {
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPreview(URL.createObjectURL(nextFile));
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    onFileChange(event.dataTransfer.files?.[0] ?? null);
  }

  function applyPreset(preset: BriefPreset) {
    if (!category.trim()) setCategory(preset.category);
    setStyle(preset.imageStylePreset);
    setImageStylePreset(preset.imageStylePreset);
    setTargetMarket(preset.targetMarket);
    setTone(preset.tone);
    setSeoKeywords(preset.seoKeywords.join(", "));
    setBrandVoice(preset.brandVoice);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Add a product image first.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("file", file);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const upload = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(upload.error || "Upload failed.");

      const productResponse = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          style,
          targetMarket,
          tone,
          seoKeywords: seoKeywords.split(",").map((item) => item.trim()).filter(Boolean),
          language,
          brandVoice,
          imageStylePreset: imageStylePreset || style,
          originalImageUrl: upload.url,
          storageKey: upload.key
        })
      });
      const product = await productResponse.json();
      if (!productResponse.ok) throw new Error(product.error || "Product creation failed.");

      router.push(`/products/${product.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-h-[520px] border border-line bg-white p-4 sm:p-6">
        <label
          htmlFor="image"
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`studio-focus relative grid h-full min-h-[440px] cursor-pointer place-items-center border border-dashed text-center transition ${
            isDragging
              ? "border-action bg-emerald-50"
              : "border-stone-300 bg-canvas hover:border-action hover:bg-emerald-50/40"
          }`}
        >
          <input
            id="image"
            name="image"
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
          {preview ? (
            <span className="relative block h-full max-h-[520px] min-h-[420px] w-full">
              <Image src={preview} alt="Upload preview" fill className="object-contain" />
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onFileChange(null);
                }}
                className="studio-focus absolute right-3 top-3 inline-flex h-10 items-center gap-2 rounded bg-white px-3 text-sm font-semibold text-ink shadow-sm ring-1 ring-line hover:bg-canvas"
              >
                Replace
                <RotateCcw className="h-4 w-4" aria-hidden />
              </button>
              <span className="absolute bottom-3 left-3 right-3 rounded bg-white/95 px-3 py-2 text-left text-sm font-medium text-ink shadow-sm ring-1 ring-line">
                {fileLabel}
              </span>
            </span>
          ) : (
            <span className="flex max-w-sm flex-col items-center gap-4 px-4">
              <span className="grid h-14 w-14 place-items-center rounded bg-ink text-white">
                {isDragging ? (
                  <ImagePlus className="h-6 w-6" aria-hidden />
                ) : (
                  <UploadCloud className="h-6 w-6" aria-hidden />
                )}
              </span>
              <span className="text-lg font-semibold">
                {isDragging ? "Drop product image" : "Upload product image"}
              </span>
              <span className="text-sm text-muted">{fileLabel}</span>
            </span>
          )}
        </label>
      </section>

      <aside className="border border-line bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">New product draft</h1>
            <p className="mt-2 text-sm text-muted">
              Start with one clear product photo. The app will infer the product name and category.
            </p>
          </div>
          {file ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-action" aria-hidden /> : null}
        </div>

        <details className="mt-6 border-t border-line pt-4">
          <summary className="cursor-pointer text-sm font-medium">
            Optional draft details
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium">Brief preset</p>
              <div className="mt-2 grid gap-2">
                {briefPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="studio-focus rounded border border-line bg-canvas p-3 text-left transition hover:border-action hover:bg-white"
                  >
                    <span className="block text-sm font-semibold">{preset.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {preset.imageStylePreset} · {preset.tone}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-medium">Product name override</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
                placeholder="Portable espresso maker"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Category override</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
                placeholder="Outdoor lifestyle"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Image style override</span>
              <select
                value={style}
                onChange={(event) => {
                  setStyle(event.target.value);
                  setImageStylePreset(event.target.value);
                }}
                className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
              >
                <option value="">Infer from product</option>
                {imageStyleOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Target market</span>
              <input
                value={targetMarket}
                onChange={(event) => setTargetMarket(event.target.value)}
                className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
                placeholder="UK streetwear shoppers"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Tone</span>
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
              >
                {toneOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">SEO keywords</span>
              <input
                value={seoKeywords}
                onChange={(event) => setSeoKeywords(event.target.value)}
                className="studio-focus mt-2 h-11 w-full rounded border border-line bg-white px-3"
                placeholder="black joggers, drawstring sweatpants"
              />
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
            <label className="block">
              <span className="text-sm font-medium">Brand voice</span>
              <textarea
                value={brandVoice}
                onChange={(event) => setBrandVoice(event.target.value)}
                className="studio-focus mt-2 min-h-24 w-full rounded border border-line bg-white p-3"
                placeholder="Short, confident, product-led, no exaggerated claims."
              />
            </label>
          </div>
        </details>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="studio-focus mt-6 inline-flex h-11 w-full items-center justify-center rounded bg-action px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Creating draft...
            </>
          ) : (
            "Create product draft"
          )}
        </button>
      </aside>
    </form>
  );
}
