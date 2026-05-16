import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@pulse/ui', '@pulse/types', '@pulse/store', '@pulse/services', '@pulse/hooks'],
};

export default nextConfig;
