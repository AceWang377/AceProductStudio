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
          "/how-it-works",
          "/pricing",
          "/support",
          "/privacy",
          "/terms",
          "/refund",
          "/opengraph-image",
          seoPages.shopifyAiProductListingGenerator.path,
          seoPages.shopifyProductImageGenerator.path,
          seoPages.shopifySeoProductDescriptionGenerator.path,
          seoPages.shopifySeoGeoOptimizer.path,
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
          "/growth",
          "/launch",
          "/login",
          "/products",
          "/qa",
          "/settings",
          "/usage"
        ]
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url
  };
}
