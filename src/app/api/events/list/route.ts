import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Listar todas as edições de eventos
export async function GET() {
  try {
    const editions = await prisma.eventEdition.findMany({
      orderBy: {
        data_inicio: 'desc'
      },
      include: {
        _count: {
          select: {
            guests: true,
            preselections: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      editions
    });
  } catch (error) {
    console.error("Erro ao listar edições:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao listar edições de eventos" },
      { status: 500 }
    );
  }
}