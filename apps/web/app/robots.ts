import type { MetadataRoute } from "next";
import { seoResourceList } from "@/lib/seo-resources";
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
          seoPages.aiShopifyDraftPublisher.path,
          "/resources",
          ...seoResourceList.map((article) => `/resources/${article.slug}`)
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
