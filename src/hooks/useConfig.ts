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
        } else {
          setConfig({ INVITE_BASE_URL: 'https://go.opens.com.br/elga' });
        }
      } catch {
        setConfig({ INVITE_BASE_URL: 'https://go.opens.com.br/elga' });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
}
