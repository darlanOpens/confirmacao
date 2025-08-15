import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removendo basePath pois o Easypanel não suporta rewrite de paths
  // O app será servido diretamente na raiz
  
  // Configurações para melhorar o build e deploy
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  
  // Configurações de output para produção
  output: 'standalone',
  
  // Configurações para lidar com erros de build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
