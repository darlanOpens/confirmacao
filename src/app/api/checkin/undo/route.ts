import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, undoneBy = "Sistema", reason } = body;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: "ID do participante é obrigatório." },
        { status: 400 }
      );
    }

    // Verificar se o participante existe
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(guestId) }
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, error: "Participante não encontrado." },
        { status: 404 }
      );
    }

    if (!guest.checkin_realizado) {
      return NextResponse.json(
        { success: false, error: "Check-in não foi realizado para este participante." },
        { status: 400 }
      );
    }

    // Desfazer o check-in
    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(guestId) },
      data: {
        checkin_realizado: false,
        data_checkin: null,
        checkin_por: null
      }
    });

    console.log(`🔄 Check-in desfeito para ${updatedGuest.nome} (ID: ${updatedGuest.id}) por ${undoneBy}. Motivo: ${reason || 'Não informado'}`);

    return NextResponse.json({
      success: true,
      guest: updatedGuest,
      message: `Check-in desfeito com sucesso para ${updatedGuest.nome}`,
      undo_details: {
        desfeito_por: undoneBy,
        motivo: reason || null,
        data_acao: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Erro ao desfazer check-in:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
