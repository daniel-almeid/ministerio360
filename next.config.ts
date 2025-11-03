import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        // Garante que CSS usa PostCSS normal (Tailwind)
        '*.css': ['postcss-loader'],
      },
    },
    // 🚫 Desativa Lightning CSS para evitar erro de build na Vercel
    optimizeCss: false,
    lightningcss: false,
  },
};

module.exports = nextConfig;