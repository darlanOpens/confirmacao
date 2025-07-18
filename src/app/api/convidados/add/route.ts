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

    // Enviar dados para o webhook
    console.log("Enviando dados para o webhook...", newGuest);
    
    try {
      const webhookResponse = await fetch("https://n8n.opens.com.br/webhook/elga-guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "elga-guests-app/1.0",
        },
        body: JSON.stringify({
          ...newGuest,
          timestamp: new Date().toISOString(),
          action: "guest_created"
        }),
      });

      console.log("Status do webhook:", webhookResponse.status);
      
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error("Erro no webhook - Status:", webhookResponse.status, "Resposta:", errorText);
      } else {
        console.log("Webhook enviado com sucesso!");
      }
    } catch (webhookError) {
      console.error("Erro ao enviar webhook:", webhookError);
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