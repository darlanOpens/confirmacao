import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Obter a edição ativa ou criar uma se não existir
export async function GET() {
  try {
    // Buscar edição ativa
    let activeEdition = await prisma.eventEdition.findFirst({
      where: {
        ativo: true,
        arquivado: false
      }
    });

    // Se não existe edição ativa, criar uma nova
    if (!activeEdition) {
      const now = new Date();
      const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      const monthName = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const editionName = `${monthName} ${year}`;

      activeEdition = await prisma.eventEdition.create({
        data: {
          nome: editionName,
          descricao: `Evento de ${editionName}`,
          data_inicio: now,
          ativo: true,
          arquivado: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      edition: activeEdition
    });
  } catch (error) {
    console.error("Erro ao obter edição ativa:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao obter edição ativa" },
      { status: 500 }
    );
  }
}