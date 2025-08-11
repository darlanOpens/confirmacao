export function buildInviteUrl(email: string): string {
  const baseUrl = process.env.INVITE_BASE_URL || 'https://go.opens.com.br/elga';
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('emailconf', email);
    return url.toString();
  } catch {
    // Fallback simples caso a baseUrl não seja uma URL válida
    return `${baseUrl}?emailconf=${encodeURIComponent(email)}`;
  }
}


