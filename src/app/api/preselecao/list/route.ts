import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const preselections = await prisma.preselection.findMany({
      orderBy: [
        { prioridade: 'asc' }, // alta primeiro, depois média, baixa
        { data_cadastro: 'desc' },
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
