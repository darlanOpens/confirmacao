import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGuestAddedWebhook } from "@/lib/webhook";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, telefone, empresa, cargo, convidado_por } = body;

    if (!nome || !email || !telefone || !empresa || !cargo || !convidado_por) {
      return NextResponse.json(
        { success: false, error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    const newGuest = await prisma.guest.create({
      data: {
        nome,
        email,
        telefone,
        empresa,
        cargo,
        convidado_por,
      },
    });

    // Dispara webhook de forma assíncrona (não bloqueia a resposta)
    sendGuestAddedWebhook(newGuest).catch(error => {
      console.error('Erro ao enviar webhook:', error);
    });

    return NextResponse.json({ success: true, guest: newGuest }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao cadastrar o convidado." },
      { status: 500 }
    );
  }
} 