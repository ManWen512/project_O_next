import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Use empty object or specific paths instead of false
      net: {},
      dns: {},
      tls: {},
      fs: {},
      child_process: {},
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "project-o-bucket.s3.ap-southeast-1.amazonaws.com",
        port: "", // leave empty
        pathname: "/**", // allow all paths
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
