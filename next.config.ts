import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Apenas temporário para identificar o problema real
  },
  images: {
    domains: ['github.com'],
  },
  
};

export default nextConfig;