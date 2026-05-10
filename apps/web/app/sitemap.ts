import type { MetadataRoute } from "next";
import { seoResourceList } from "@/lib/seo-resources";
import { seoPages } from "@/lib/seo-pages";
import { siteConfig } from "@/lib/site";

const publicRoutes = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1
  },
  {
    path: "/support",
    changeFrequency: "monthly",
    priority: 0.5
  },
  {
    path: "/how-it-works",
    changeFrequency: "monthly",
    priority: 0.85
  },
  {
    path: "/pricing",
    changeFrequency: "monthly",
    priority: 0.8
  },
  {
    path: "/privacy",
    changeFrequency: "yearly",
    priority: 0.3
  },
  {
    path: "/terms",
    changeFrequency: "yearly",
    priority: 0.3
  },
  {
    path: "/refund",
    changeFrequency: "yearly",
    priority: 0.3
  },
  {
    path: seoPages.shopifyAiProductListingGenerator.path,
    changeFrequency: "monthly",
    priority: 0.9
  },
  {
    path: seoPages.shopifyProductImageGenerator.path,
    changeFrequency: "monthly",
    priority: 0.8
  },
  {
    path: seoPages.shopifySeoProductDescriptionGenerator.path,
    changeFrequency: "monthly",
    priority: 0.8
  },
  {
    path: seoPages.shopifySeoGeoOptimizer.path,
    changeFrequency: "monthly",
    priority: 0.85
  },
  {
    path: seoPages.aiShopifyDraftPublisher.path,
    changeFrequency: "monthly",
    priority: 0.8
  },
  {
    path: "/resources",
    changeFrequency: "monthly",
    priority: 0.7
  }
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...publicRoutes.map((route) => ({
      url: `${siteConfig.url}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority
    })),
    ...seoResourceList.map((article) => ({
      url: `${siteConfig.url}/resources/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.65
    }))
  ];
}
