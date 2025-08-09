import type { NextConfig } from "next";
import design from './design.json';

const basePath = (design as any)?.meta?.base_path || '';

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
};

export default nextConfig;
