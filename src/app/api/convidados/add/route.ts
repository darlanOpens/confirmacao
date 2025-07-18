import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    try {
      await fetch("https://n8n.opens.com.br/webhook/elga-guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGuest),
      });
    } catch (webhookError) {
      console.error("Erro ao enviar webhook:", webhookError);
      // Opcional: Adicionar lógica para lidar com falha no webhook,
      // mas sem bloquear a resposta principal.
    }

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