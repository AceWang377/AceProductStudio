import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = "AceStudio AI Shopify product listing workspace";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#eef4ef",
          color: "#151917",
          display: "flex",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: 72,
          width: "100%"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 610 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div
              style={{
                alignItems: "center",
                background: "#11735d",
                borderRadius: 18,
                color: "white",
                display: "flex",
                fontSize: 36,
                fontWeight: 700,
                height: 78,
                justifyContent: "center",
                width: 78
              }}
            >
              AS
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>{siteConfig.name}</span>
              <span style={{ color: "#506158", fontSize: 22 }}>AI Shopify product workspace</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ color: "#11735d", fontSize: 24, fontWeight: 700 }}>
              Shopify-ready AI product listing generator
            </div>
            <div style={{ fontSize: 66, fontWeight: 700, letterSpacing: 0, lineHeight: 1.02 }}>
              Generate media, SEO copy, and Shopify drafts from one product photo.
            </div>
          </div>

          <div style={{ color: "#506158", fontSize: 24 }}>
            Draft-first publishing · OAuth stores · 4+ generated images
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "2px solid #c8d6cf",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            padding: 28,
            width: 360
          }}
        >
          {["Lifestyle image", "Product detail", "SEO copy", "Shopify draft"].map((label, index) => (
            <div
              key={label}
              style={{
                alignItems: "center",
                background: index === 3 ? "#11735d" : "#f6f8f6",
                color: index === 3 ? "white" : "#151917",
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                height: 92,
                justifyContent: "space-between",
                padding: "0 24px"
              }}
            >
              <span>{label}</span>
              <span>{index === 3 ? "Ready" : "✓"}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
