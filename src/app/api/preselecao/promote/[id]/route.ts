import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildInviteUrl } from "@/lib/invite";
import { sendGuestAddedWebhook, sendPreselectionPromotedWebhook } from "@/lib/webhook";

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

    // Verificar se o telefone já existe na tabela guest
    const existingGuest = await prisma.guest.findUnique({
      where: { telefone: preselection.telefone },
    });

    if (existingGuest) {
      return NextResponse.json(
        { success: false, error: "Este telefone já está cadastrado como convidado." },
        { status: 409 }
      );
    }

    // Criar Guest com dados da pré-seleção (status padrão é "Convidado")
    const guestData = {
      nome: preselection.nome,
      email: preselection.email,
      telefone: preselection.telefone,
      empresa: preselection.empresa,
      cargo: preselection.cargo,
      convidado_por,
      status: "Convidado", // Novo padrão
      convite_url: buildInviteUrl(preselection.telefone, convidado_por),
    };

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar Guest
      const newGuest = await tx.guest.create({
        data: guestData,
      });

      // Marcar a pré-seleção como promovida (não remover)
      const updatedPreselection = await tx.preselection.update({
        where: { id },
        data: { status: "Convidado" },
      });

      return { newGuest, updatedPreselection };
    });

    // Disparar webhooks assíncronos
    sendGuestAddedWebhook(result.newGuest).catch(error => {
      console.error('❌ Erro ao enviar webhook:', error);
    });
    sendPreselectionPromotedWebhook({ preselection: result.updatedPreselection, guest: result.newGuest }).catch(error => {
      console.error('❌ Erro ao enviar webhook de promoção:', error);
    });

    return NextResponse.json(
      { 
        success: true, 
        guest: result.newGuest,
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
        { success: false, error: "Este telefone já está cadastrado como convidado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao promover o contato." },
      { status: 500 }
    );
  }
}