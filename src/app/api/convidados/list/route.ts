import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveEdition } from "@/lib/edition";

export async function GET() {
  try {
    // Obter ou criar edição ativa
    const activeEdition = await getOrCreateActiveEdition();

    // Buscar convidados da edição ativa
    const guests = await prisma.guest.findMany({
      where: {
        edition_id: activeEdition.id
      },
      orderBy: {
        data_cadastro: 'desc',
      },
    });
    return NextResponse.json({ success: true, guests }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao buscar os convidados." },
      { status: 500 }
    );
  }
} 