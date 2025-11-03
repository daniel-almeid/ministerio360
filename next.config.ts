import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: false, // desativa lightningcss para evitar conflito
  },
  turbopack: {}, // compatibilidade futura
};

export default nextConfig;
