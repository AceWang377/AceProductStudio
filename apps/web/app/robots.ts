import type { MetadataRoute } from "next";
import { seoPages } from "@/lib/seo-pages";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/support",
          "/privacy",
          "/terms",
          "/refund",
          "/opengraph-image",
          seoPages.shopifyProductImageGenerator.path,
          seoPages.shopifySeoProductDescriptionGenerator.path,
          seoPages.aiShopifyDraftPublisher.path
        ],
        disallow: [
          "/account",
          "/admin",
          "/api",
          "/auth",
          "/billing",
          "/dashboard",
          "/launch",
          "/login",
          "/products",
          "/settings",
          "/usage"
        ]
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url
  };
}
