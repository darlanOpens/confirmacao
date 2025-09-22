import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Parser } from 'json2csv';

// Arquivar uma edição (exporta dados e marca como arquivada)
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);

    // Buscar a edição
    const edition = await prisma.eventEdition.findUnique({
      where: { id },
      include: {
        guests: true,
        preselections: true
      }
    });

    if (!edition) {
      return NextResponse.json(
        { success: false, error: "Edição não encontrada" },
        { status: 404 }
      );
    }

    // Gerar CSV dos convidados
    let guestsCsv = '';
    if (edition.guests.length > 0) {
      const guestFields = [
        'nome', 'email', 'telefone', 'empresa', 'cargo',
        'convidado_por', 'status', 'data_cadastro', 'data_confirmacao',
        'nome_preferido', 'linkedin_url', 'tamanho_empresa',
        'setor_atuacao', 'produtos_servicos', 'faturamento_anual', 'modelo_negocio'
      ];
      const guestParser = new Parser({ fields: guestFields });
      guestsCsv = guestParser.parse(edition.guests);
    }

    // Gerar CSV das pré-seleções
    let preselectionsCsv = '';
    if (edition.preselections.length > 0) {
      const preselectionFields = [
        'nome', 'email', 'telefone', 'empresa', 'cargo', 'status', 'data_cadastro'
      ];
      const preselectionParser = new Parser({ fields: preselectionFields });
      preselectionsCsv = preselectionParser.parse(edition.preselections);
    }

    // Marcar edição como arquivada e inativa
    const updatedEdition = await prisma.eventEdition.update({
      where: { id },
      data: {
        ativo: false,
        arquivado: true,
        data_fim: new Date()
      }
    });

    // Criar nova edição ativa automaticamente
    const now = new Date();
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Avançar para o próximo mês
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthName = monthNames[nextMonth.getMonth()];
    const year = nextMonth.getFullYear();
    const newEditionName = `${monthName} ${year}`;

    const newEdition = await prisma.eventEdition.create({
      data: {
        nome: newEditionName,
        descricao: `Evento de ${newEditionName}`,
        data_inicio: new Date(),
        ativo: true,
        arquivado: false
      }
    });

    return NextResponse.json({
      success: true,
      archivedEdition: updatedEdition,
      newEdition,
      exports: {
        guestsCsv,
        preselectionsCsv,
        guestsCount: edition.guests.length,
        preselectionsCount: edition.preselections.length
      }
    });
  } catch (error) {
    console.error("Erro ao arquivar edição:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao arquivar edição" },
      { status: 500 }
    );
  }
}