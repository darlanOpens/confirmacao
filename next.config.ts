import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removendo basePath pois o Easypanel não suporta rewrite de paths
  // O app será servido diretamente na raiz
};

export default nextConfig;
