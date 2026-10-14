import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright-core"],
  poweredByHeader: false,
};

export default nextConfig;
