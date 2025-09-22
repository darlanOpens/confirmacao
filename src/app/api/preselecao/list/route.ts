import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveEdition } from "@/lib/edition";

export async function GET() {
  try {
    // Obter ou criar edição ativa
    const activeEdition = await getOrCreateActiveEdition();

    const preselections = await prisma.preselection.findMany({
      where: {
        edition_id: activeEdition.id
      },
      orderBy: [
        { data_cadastro: 'desc' }, // mais recentes primeiro
      ],
    });
    return NextResponse.json({ success: true, preselections }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao buscar as pré-seleções." },
      { status: 500 }
    );
  }
}
