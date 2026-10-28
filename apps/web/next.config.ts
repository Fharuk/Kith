import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kith/domain", "@kith/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
