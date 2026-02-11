import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use src directory for app
  experimental: {
    // Enable server actions for Plaid and other secure operations
  },
};

export default nextConfig;
