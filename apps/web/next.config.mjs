import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.acezerotrading.com"
          }
        ],
        destination: "https://acezerotrading.com/:path*",
        permanent: true
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  transpilePackages: [
    "@ai-product-studio/ai",
    "@ai-product-studio/database",
    "@ai-product-studio/queue",
    "@ai-product-studio/shopify",
    "@ai-product-studio/storage"
  ]
};

export default nextConfig;
