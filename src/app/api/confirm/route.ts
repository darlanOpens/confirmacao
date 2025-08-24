import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGuestConfirmedWebhook } from "@/lib/webhook";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Confirma um convidado, atualizando seu status para "confirmado"
 * Aceita busca por ID (preferível) ou por telefone (fallback)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, telefone } = body;

    // Pelo menos um identificador deve ser fornecido
    if (!id && !telefone) {
      return NextResponse.json(
        { success: false, error: "ID ou telefone é obrigatório." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Buscar convidado por ID (preferível) ou por telefone (fallback)
    let guest;
    if (id) {
      guest = await prisma.guest.findUnique({
        where: { id: parseInt(String(id), 10) },
      });
    } else {
      guest = await prisma.guest.findUnique({
        where: { telefone },
      });
    }

    if (!guest) {
      return NextResponse.json(
        { success: false, found: false, error: "Convidado não encontrado." },
        { status: 404, headers: corsHeaders }
      );
    }

    // Confirmar convidado se ainda não confirmado
    const updatedGuest =
      guest.status !== "confirmado"
        ? await prisma.guest.update({
            where: { id: guest.id }, // Sempre usar ID para atualização
            data: { status: "confirmado", data_confirmacao: new Date() },
          })
        : guest;
    
    // Se o status foi alterado para confirmado, enviar webhook
    if (guest.status !== "confirmado" && updatedGuest.status === "confirmado") {
      // Enviar webhook de forma assíncrona para não bloquear a resposta
      sendGuestConfirmedWebhook(updatedGuest).catch(error => {
        console.error("Erro ao enviar webhook de confirmação:", error);
      });
    }

    return NextResponse.json(
      { success: true, found: true, guest: updatedGuest },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Erro ao confirmar convidado:", error);
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro interno." },
      { status: 500, headers: corsHeaders }
    );
  }
}