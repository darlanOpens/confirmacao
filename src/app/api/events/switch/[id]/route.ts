import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Trocar para uma edição específica (tornar ativa)
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);

    // Verificar se a edição existe
    const edition = await prisma.eventEdition.findUnique({
      where: { id }
    });

    if (!edition) {
      return NextResponse.json(
        { success: false, error: "Edição não encontrada" },
        { status: 404 }
      );
    }

    // Desativar todas as outras edições
    await prisma.eventEdition.updateMany({
      where: {
        ativo: true
      },
      data: {
        ativo: false
      }
    });

    // Ativar a edição selecionada
    const updatedEdition = await prisma.eventEdition.update({
      where: { id },
      data: {
        ativo: true
      }
    });

    return NextResponse.json({
      success: true,
      edition: updatedEdition
    });
  } catch (error) {
    console.error("Erro ao trocar edição:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao trocar edição" },
      { status: 500 }
    );
  }
}