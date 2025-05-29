import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // موقتاً غیرفعال
  },
  typescript: {
    ignoreBuildErrors: true, // موقتاً غیرفعال
  },
  images: {
    domains: ["localhost", "hooshmetr.com", "hooshmetr.ir"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "api.hooshmetr.com",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "hooshmetr.com",
        pathname: "/static/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "hooshmetr.com", "hooshmetr.ir"],
    },
  },
};

export default nextConfig;
