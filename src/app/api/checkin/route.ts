import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGuestCheckinWebhook } from "@/lib/webhook";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, checkinBy = "Sistema", notes } = body;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: "ID do participante é obrigatório." },
        { status: 400 }
      );
    }

    // Verificar se o participante existe e está confirmado
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(guestId) }
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, error: "Participante não encontrado." },
        { status: 404 }
      );
    }

    if (!guest.data_confirmacao) {
      return NextResponse.json(
        { success: false, error: "Participante não confirmou presença." },
        { status: 400 }
      );
    }

    if (guest.checkin_realizado) {
      return NextResponse.json(
        { success: false, error: "Check-in já foi realizado para este participante." },
        { status: 400 }
      );
    }

    // Realizar o check-in
    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(guestId) },
      data: {
        checkin_realizado: true,
        data_checkin: new Date(),
        checkin_por: checkinBy
      }
    });

    console.log(`✅ Check-in realizado para ${updatedGuest.nome} (ID: ${updatedGuest.id}) por ${checkinBy}`);

    // Enviar webhook de check-in de forma assíncrona
    setImmediate(() => {
      sendGuestCheckinWebhook({
        ...updatedGuest,
        data_checkin: updatedGuest.data_checkin,
        checkin_realizado: updatedGuest.checkin_realizado || false,
        checkin_por: updatedGuest.checkin_por
      }).catch(error => {
        console.error('❌ Erro ao enviar webhook de check-in:', error);
      });
    });

    return NextResponse.json({
      success: true,
      guest: updatedGuest,
      message: `Check-in realizado com sucesso para ${updatedGuest.nome}`,
      checkin_details: {
        realizado_por: checkinBy,
        data_checkin: updatedGuest.data_checkin,
        notes: notes || null
      }
    });

  } catch (error) {
    console.error("❌ Erro ao realizar check-in:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// Endpoint para buscar participantes confirmados
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let whereClause: any = {
      data_confirmacao: { not: null }
    };

    // Se há termo de busca, adicionar filtros
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      whereClause.OR = [
        { nome: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { telefone: { contains: searchTerm, mode: 'insensitive' } },
        { empresa: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const guests = await prisma.guest.findMany({
      where: whereClause,
      orderBy: [
        { checkin_realizado: 'asc' }, // Não check-in primeiro
        { nome: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      guests
    });

  } catch (error) {
    console.error("❌ Erro ao buscar participantes confirmados:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}