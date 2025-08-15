import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { telefone } = body;

    if (!telefone) {
      return NextResponse.json(
        { success: false, error: "O telefone é obrigatório." },
        { status: 400, headers: corsHeaders }
      );
    }

    const guest = await prisma.guest.findUnique({
      where: { telefone },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, found: false, error: "Convidado não encontrado." },
        { status: 404, headers: corsHeaders }
      );
    }

  const updatedGuest =
    guest.status !== "confirmado"
      ? await prisma.guest.update({
          where: { telefone },
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