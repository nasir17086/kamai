import type { NextConfig } from "next";

// Static export: the app is fully client-side, so `out/` can be hosted on any static host.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
