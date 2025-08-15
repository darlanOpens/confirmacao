// Configurações globais para evitar problemas de build
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Configurações para melhorar o comportamento em produção
if (typeof window === 'undefined') {
  // Server-side only configurations
  process.env.NEXT_TELEMETRY_DISABLED = '1';
}

// Configurações de cache para APIs
export const apiConfig = {
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  },
  cache: 'no-store' as const,
};

// Configurações para fallback de dados
export const fallbackData = {
  guests: [],
  preselections: [],
};