export function buildInviteUrl(email: string): string {
  const baseUrl = process.env.INVITE_BASE_URL || 'https://go.opens.com.br/brunch-esquenta';
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('emailconf', email);
    return url.toString();
  } catch {
    // Fallback simples caso a baseUrl não seja uma URL válida
    return `${baseUrl}?emailconf=${encodeURIComponent(email)}`;
  }
}

export function buildTrackingUrl(convidadoPor?: string | null): string {
  const baseUrl = process.env.INVITE_BASE_URL || 'https://go.opens.com.br/brunch-esquenta';
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
