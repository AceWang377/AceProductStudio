import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
