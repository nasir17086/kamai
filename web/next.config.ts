import type { NextConfig } from "next";

// Static export: the app is fully client-side, so `out/` can be hosted on any static host.
const nextConfig: NextConfig = {
  output: "export",
  // e.g. "/kamai" when hosted on GitHub Pages under the repo path.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
