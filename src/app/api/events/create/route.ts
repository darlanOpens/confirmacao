import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Criar nova edição de evento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao } = body;

    if (!nome) {
      return NextResponse.json(
        { success: false, error: "Nome da edição é obrigatório" },
        { status: 400 }
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

    // Criar nova edição ativa
    const newEdition = await prisma.eventEdition.create({
      data: {
        nome,
        descricao: descricao || `Evento ${nome}`,
        data_inicio: new Date(),
        ativo: true,
        arquivado: false
      }
    });

    return NextResponse.json({
      success: true,
      edition: newEdition
    });
  } catch (error) {
    console.error("Erro ao criar edição:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar nova edição" },
      { status: 500 }
    );
  }
}