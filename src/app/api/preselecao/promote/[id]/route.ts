import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildInviteUrl } from "@/lib/invite";
import { sendGuestAddedWebhook } from "@/lib/webhook";

// Promover uma pré-seleção para Guest convidado
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { convidado_por } = body;

    if (!convidado_por) {
      return NextResponse.json(
        { success: false, error: "Campo 'convidado_por' é obrigatório para promover." },
        { status: 400 }
      );
    }

    // Buscar a pré-seleção
    const preselection = await prisma.preselection.findUnique({
      where: { id },
    });

    if (!preselection) {
      return NextResponse.json(
        { success: false, error: "Pré-seleção não encontrada." },
        { status: 404 }
      );
    }

    // Verificar se o email já existe na tabela guest
    const existingGuest = await prisma.guest.findUnique({
      where: { email: preselection.email },
    });

    if (existingGuest) {
      return NextResponse.json(
        { success: false, error: "Este e-mail já está cadastrado como convidado." },
        { status: 409 }
      );
    }

    // Criar Guest com dados da pré-seleção (status padrão é "pendente")
    const guestData = {
      nome: preselection.nome,
      email: preselection.email,
      telefone: preselection.telefone,
      empresa: preselection.empresa,
      cargo: preselection.cargo,
      convidado_por,
      status: "pendente", // Explicitamente definindo como pendente
      convite_url: buildInviteUrl(preselection.email, convidado_por),
    };

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar Guest
      const newGuest = await tx.guest.create({
        data: guestData,
      });

      // Remover da pré-seleção
      await tx.preselection.delete({
        where: { id },
      });

      return newGuest;
    });

    // Disparar webhook assíncrono
    sendGuestAddedWebhook(result).catch(error => {
      console.error('❌ Erro ao enviar webhook:', error);
    });

    return NextResponse.json(
      { 
        success: true, 
        guest: result,
        message: "Contato promovido com sucesso para convidados!"
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao promover pré-seleção:', error);
    
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "Este e-mail já está cadastrado como convidado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao promover o contato." },
      { status: 500 }
    );
  }
}