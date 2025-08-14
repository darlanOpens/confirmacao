import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const;

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: {
        data_cadastro: 'desc',
      },
    });
    return NextResponse.json({ success: true, guests }, { status: 200, headers: noCacheHeaders });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao buscar os convidados." },
      { status: 500, headers: noCacheHeaders }
    );
  }
} 