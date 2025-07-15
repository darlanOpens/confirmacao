import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const guest = await prisma.guest.findUnique({
      where: { email },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, found: false, error: "Convidado não encontrado." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (guest.status === "pendente") {
      await prisma.guest.update({
        where: { email },
        data: { status: "confirmado", data_confirmacao: new Date() },
      });
    }

    return NextResponse.json(
      { success: true, found: true, name: guest.nome },
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro interno." },
      { status: 500, headers: corsHeaders }
    );
  }
} 