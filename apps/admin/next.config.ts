import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@wors/ui'],
  serverExternalPackages: ['better-sqlite3'],
  basePath: '/wors-edit',
  trailingSlash: true,
};

export default nextConfig;
