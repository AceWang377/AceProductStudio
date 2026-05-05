import type { MetadataRoute } from "next";
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
    path: seoPages.aiShopifyDraftPublisher.path,
    changeFrequency: "monthly",
    priority: 0.8
  }
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
