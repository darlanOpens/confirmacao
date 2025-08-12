import { NextResponse } from "next/server";

export async function GET() {
  // Esta rota deve ser removida em produção por questões de segurança
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    variables: {
      NEXT_PUBLIC_INVITE_BASE_URL: process.env.NEXT_PUBLIC_INVITE_BASE_URL || 'NÃO CONFIGURADA',
      INVITE_BASE_URL: process.env.INVITE_BASE_URL || 'NÃO CONFIGURADA',
      WEBHOOK_URL: process.env.WEBHOOK_URL || 'NÃO CONFIGURADA',
      DATABASE_URL: process.env.DATABASE_URL ? '***CONFIGURADA***' : 'NÃO CONFIGURADA',
    },
    fallbacks: {
      invite_url_fallback: 'https://go.opens.com.br/brunch-vip',
      webhook_url_fallback: 'https://n8n.opens.com.br/webhook/elga-guests',
    }
  };

  return NextResponse.json(debug);
}
