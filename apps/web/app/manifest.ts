import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AceStudio",
    short_name: "AceStudio",
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
        src: "/ace-studio-favicon-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/ace-studio-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/ace-studio-apple-icon-180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/apple-icon.png",
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
        label: "AceStudio Shopify product and SEO/GEO workspace"
      }
    ]
  };
}
