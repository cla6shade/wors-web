import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@wors/ui'],
  serverExternalPackages: ['better-sqlite3'],
  basePath: '/wors',
  trailingSlash: true,
  allowedDevOrigins: ['http://localhost:3001', 'http://10.104.1.80:3001'],
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig);
