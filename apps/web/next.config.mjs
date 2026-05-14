import path from "node:path";

const privateNoIndexPaths = [
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
];

const iconNoCachePaths = [
  "/ace-studio-favicon-96.png",
  "/ace-studio-icon-512.png",
  "/ace-studio-apple-icon-180.png",
  "/favicon.ico",
  "/favicon.png",
  "/icon.png",
  "/apple-icon.png",
  "/manifest.webmanifest"
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/favicon.png",
        destination: "/ace-studio-favicon-96.png"
      }
    ];
  },
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
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "ace-product-studio.vercel.app"
          }
        ],
        destination: "https://acezerotrading.com/:path*",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      ...iconNoCachePaths.map((source) => ({
        source,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate"
          }
        ]
      })),
      ...privateNoIndexPaths.flatMap((source) =>
        [source, `${source}/:path*`].map((pathSource) => ({
          source: pathSource,
          headers: [
            {
              key: "X-Robots-Tag",
              value: "noindex, nofollow"
            }
          ]
        }))
      )
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
