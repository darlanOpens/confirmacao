import design from '../../design.json';

export const basePath: string = (design as any)?.meta?.base_path || '';

export function withBasePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!basePath) return normalized;
  return `${basePath}${normalized}`;
}


