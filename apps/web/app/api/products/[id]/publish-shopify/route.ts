import { NextResponse } from "next/server";
import { createShopifyProductDraft, getShopifyCredentialStatus } from "@ai-product-studio/shopify";
import { addJob, getProduct, readState, updateProduct } from "@/lib/store";
import { getOrderedPublishImages } from "@/lib/product-images";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function paragraphize(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function buildDescriptionHtml(product: NonNullable<Awaited<ReturnType<typeof getProduct>>>) {
  const description = paragraphize(product.description || "");
  const bullets = product.bulletPoints.length
    ? `<h3>Highlights</h3><ul>${product.bulletPoints
        .map((point) => `<li>${escapeHtml(point)}</li>`)
        .join("")}</ul>`
    : "";
  const faq = product.faq.length
    ? `<h3>FAQ</h3>${product.faq
        .map(
          (item) =>
            `<h4>${escapeHtml(item.question)}</h4><p>${escapeHtml(item.answer)}</p>`
        )
        .join("")}`
    : "";

  return `${description}${bullets}${faq}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const publishMode = body.publishMode === "ACTIVE" ? "ACTIVE" : "DRAFT";
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  if (!product.title || !product.description) {
    return NextResponse.json(
      { error: "Generate or write title and description before publishing." },
      { status: 400 }
    );
  }

  const state = await readState();
  const credentials = getShopifyCredentialStatus({
    shopDomain: state.shopifyConnection?.shopDomain,
    adminAccessToken: state.shopifyConnection?.adminAccessToken,
    clientId: state.shopifyConnection?.clientId,
    clientSecret: state.shopifyConnection?.clientSecret
  });
  if (!credentials.configured) {
    return NextResponse.json(
      {
        error:
          "Connect Shopify before publishing. Save your shop domain with an Admin API token, or save Client ID and Client secret."
      },
      { status: 400 }
    );
  }

  const generatedImageUrls = getOrderedPublishImages(product.images).map((image) => image.url);
  if (generatedImageUrls.length > 0 && generatedImageUrls.length < 4) {
    return NextResponse.json(
      { error: "Generate at least 4 product images before publishing to Shopify." },
      { status: 400 }
    );
  }
  const imageUrls = generatedImageUrls.length
    ? generatedImageUrls
    : product.images.map((image) => image.url);

  try {
    const result = await createShopifyProductDraft({
      title: product.title,
      descriptionHtml: buildDescriptionHtml(product),
      tags: product.tags,
      productType: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      sku: product.sku,
      inventoryQuantity: product.inventoryQuantity,
      trackInventory: product.trackInventory,
      publishStatus: publishMode,
      imageUrls,
      shopDomain: state.shopifyConnection?.shopDomain,
      adminAccessToken: state.shopifyConnection?.adminAccessToken,
      clientId: state.shopifyConnection?.clientId,
      clientSecret: state.shopifyConnection?.clientSecret
    });

    await updateProduct(id, {
      status: publishMode === "ACTIVE" ? "PUBLISHED" : product.status,
      shopifyStatus: publishMode === "ACTIVE" ? "PUBLISHED_LIVE" : "PUBLISHED_AS_DRAFT",
      shopifyProductId: result.shopifyProductId
    });
    const job = await addJob(id, {
      type: "SHOPIFY_PUBLISH",
      status: "COMPLETED",
      progress: 100,
      input: {
        title: product.title,
        tags: product.tags,
        imageUrls
      },
      output: {
        shopifyProductId: result.shopifyProductId,
        adminUrl: result.adminUrl,
        handle: result.handle,
        uploadedImageCount: result.uploadedImageCount,
        publishedPublicationCount: result.publishedPublicationCount,
        variantId: result.variantId,
        inventoryItemId: result.inventoryItemId,
        skippedImageUrls: result.skippedImageUrls
      },
      error: null
    });

    return NextResponse.json({
      jobId: job?.id,
      status: "completed",
      ...result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shopify publishing failed.";
    await updateProduct(id, { shopifyStatus: "FAILED" });
    const job = await addJob(id, {
      type: "SHOPIFY_PUBLISH",
      status: "FAILED",
      progress: 100,
      input: {
        title: product.title,
        tags: product.tags,
        imageUrls
      },
      error: message
    });

    return NextResponse.json({ error: message, jobId: job?.id }, { status: 502 });
  }
}
