import { useState, useEffect } from 'react';

interface Config {
  INVITE_BASE_URL: string;
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
          console.log('📡 Configuração carregada do servidor:', data);
        } else {
          console.warn('⚠️ Falha ao carregar configuração, usando fallback');
          setConfig({ INVITE_BASE_URL: 'https://go.opens.com.br/brunch-vip' });
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        setConfig({ INVITE_BASE_URL: 'https://go.opens.com.br/brunch-vip' });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
}
