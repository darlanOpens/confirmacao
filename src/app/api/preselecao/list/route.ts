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
    const preselections = await prisma.preselection.findMany({
      orderBy: [
        { data_cadastro: 'desc' }, // mais recentes primeiro
      ],
    });
    return NextResponse.json({ success: true, preselections }, { status: 200, headers: noCacheHeaders });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao buscar as pré-seleções." },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
