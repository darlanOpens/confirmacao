import { NextResponse } from "next/server";

export async function GET() {
  // Esta rota fornece configurações para o cliente em runtime
  const config = {
    INVITE_BASE_URL: process.env.INVITE_BASE_URL || 'https://go.opens.com.br/elga',
  };

  return NextResponse.json(config);
}
