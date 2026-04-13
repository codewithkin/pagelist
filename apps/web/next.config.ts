import "@pagelist/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8f58128a97274b128a88cd4e1ef0db0a.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pagelist.7b71f489541fe72763c158b881ed7ccb.r2.dev",
      },
    ],
  },
  webpack: (config) => {
    // Prevent pdfjs-dist from importing the canvas module in browser environments.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
