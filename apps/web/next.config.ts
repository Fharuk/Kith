import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kith/domain", "@kith/ui", "@kith/database"],
  // PGlite ships WASM + postgres.data assets resolved via import.meta.url, and argon2 is
  // native: both must load from node_modules, not from the server bundle.
  serverExternalPackages: ["@electric-sql/pglite", "@node-rs/argon2"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
