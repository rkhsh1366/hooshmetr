import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "hooshmetr.com", "hooshmetr.ir"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "hooshmetr.com",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "hooshmetr.ir",
        pathname: "/static/**",
      },
    ],
  },
  i18n: {
    locales: ["fa"],
    defaultLocale: "fa",
    localeDetection: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "hooshmetr.com", "hooshmetr.ir"],
    },
  },
};

export default nextConfig;
