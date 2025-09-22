import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveEdition } from "@/lib/edition";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "O e-mail é obrigatório." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Obter edição ativa
    const activeEdition = await getOrCreateActiveEdition();

    const guest = await prisma.guest.findFirst({
      where: {
        email,
        edition_id: activeEdition.id
      },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, found: false, error: "Convidado não encontrado." },
        { status: 404, headers: corsHeaders }
      );
    }

  const updatedGuest =
    guest.status === "pendente"
      ? await prisma.guest.update({
          where: { id: guest.id },
          data: { status: "confirmado", data_confirmacao: new Date() },
        })
      : guest;

  return NextResponse.json(
    { success: true, found: true, guest: updatedGuest },
    { status: 200, headers: corsHeaders }
  );
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro interno." },
      { status: 500, headers: corsHeaders }
    );
  }
} 