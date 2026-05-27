import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ACE ZERO TRADING",
    short_name: "ACE ZERO TRADING",
    description:
      "AI product content workspace for Shopify sellers: generate product images, SEO copy, GEO-ready content, and draft listings.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f8f6",
    theme_color: "#11735d",
    categories: ["business", "productivity", "shopping"],
    lang: "en",
    icons: [
      {
        src: "/ace-studio-google-favicon-v20260515.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/ace-studio-google-icon-v20260515.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/ace-studio-apple-icon-v20260515.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      }
    ],
    screenshots: [
      {
        src: `${siteConfig.url}/opengraph-image`,
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "ACE ZERO TRADING Shopify product and SEO/GEO workspace"
      }
    ]
  };
}
