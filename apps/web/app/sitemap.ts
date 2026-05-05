import type { MetadataRoute } from "next";
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
