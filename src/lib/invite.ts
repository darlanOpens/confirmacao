export function buildInviteUrl(emailOrPhone: string, convidadoPor?: string, customBaseUrl?: string): string {
  const baseUrl = customBaseUrl || 
    process.env.NEXT_PUBLIC_INVITE_BASE_URL ||
    process.env.INVITE_BASE_URL ||
    'https://go.opens.com.br/brunch-vip';
  

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('emailconf', emailOrPhone);
    if (convidadoPor && String(convidadoPor).trim() !== '') {
      url.searchParams.set('utm_source', String(convidadoPor));
    }
    return url.toString();
  } catch {
    // Fallback simples caso a baseUrl não seja uma URL válida
    return `${baseUrl}?emailconf=${encodeURIComponent(emailOrPhone)}${convidadoPor && String(convidadoPor).trim() !== '' ? `&utm_source=${encodeURIComponent(String(convidadoPor))}` : ''}`;
  }
}

export function buildTrackingUrl(convidadoPor?: string | null, customBaseUrl?: string): string {
  const baseUrl = customBaseUrl ||
    process.env.NEXT_PUBLIC_INVITE_BASE_URL ||
    process.env.INVITE_BASE_URL ||
    'https://go.opens.com.br/brunch-vip';
  

  try {
    const url = new URL(baseUrl);
    if (convidadoPor && String(convidadoPor).trim() !== '') {
      url.searchParams.set('utm_source', String(convidadoPor));
    }
    return url.toString();
  } catch {
    return `${baseUrl}${convidadoPor && String(convidadoPor).trim() !== '' ? `?utm_source=${encodeURIComponent(String(convidadoPor))}` : ''}`;
  }
}
