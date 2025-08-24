import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildInviteUrl } from "@/lib/invite";
import { sendGuestAddedWebhook, sendGuestConfirmedWebhook } from "@/lib/webhook";
import { removePhoneMask } from "@/lib/phoneUtils";

console.log('📦 API de adição de convidado carregada, webhook importado:', typeof sendGuestAddedWebhook);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      email,
      telefone,
      empresa,
      cargo,
      convidado_por,
      confirm_directly,
      nome_preferido,
      linkedin_url,
      tamanho_empresa,
      setor_atuacao,
      produtos_servicos,
      faturamento_anual,
      modelo_negocio,
    } = body;

    if (!nome || !telefone || !empresa || !cargo || !convidado_por) {
      return NextResponse.json(
        { success: false, error: "Nome, telefone, empresa, cargo e convidado por são obrigatórios." },
        { status: 400 }
      );
    }

    console.log('📝 Criando convidado no banco...');
    const maybe = (key: string, value: unknown) =>
      typeof value !== "undefined" && value !== null ? { [key]: value } : {};

    // Remove a máscara do telefone antes de salvar
    const cleanTelefone = removePhoneMask(telefone);
    // Normaliza email vazio para null (evita violar índice único quando vazio)
    const cleanEmail: string | null = email && String(email).trim() !== "" ? String(email).trim() : null;

    const data = {
      nome,
      // Email opcional: usar null quando vier vazio
      email: cleanEmail,
      telefone: cleanTelefone,
      empresa,
      cargo,
      convidado_por,
      convite_url: buildInviteUrl(cleanTelefone || cleanEmail || '', convidado_por),
      status: confirm_directly ? 'confirmado' : 'Convidado',
      ...maybe("data_confirmacao", confirm_directly ? new Date() : undefined),
      ...maybe("nome_preferido", nome_preferido),
      ...maybe("linkedin_url", linkedin_url),
      ...maybe("tamanho_empresa", tamanho_empresa),
      ...maybe("setor_atuacao", setor_atuacao),
      ...maybe("produtos_servicos", produtos_servicos),
      ...maybe("faturamento_anual", faturamento_anual),
      ...maybe("modelo_negocio", modelo_negocio),
    } as const;

    const newGuest = await prisma.guest.create({ data });
    console.log('✅ Convidado criado com sucesso:', newGuest.id);

    // Dispara webhook de forma assíncrona (não bloqueia a resposta)
    console.log('🚀 Iniciando disparo do webhook...');
    sendGuestAddedWebhook(newGuest).catch(error => {
      console.error('❌ Erro ao enviar webhook:', error);
    });
    
    // Se o convidado foi confirmado diretamente, dispara o webhook de confirmação
    if (confirm_directly) {
      console.log('🚀 Iniciando disparo do webhook de confirmação direta...');
      sendGuestConfirmedWebhook(newGuest).catch(error => {
        console.error('❌ Erro ao enviar webhook de confirmação:', error);
      });
      console.log('📤 Webhook de confirmação disparado (assíncrono)');
    }
    
    console.log('📤 Webhook disparado (assíncrono)');

    return NextResponse.json({ success: true, guest: newGuest }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      // @ts-ignore - prisma error shape
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "Este telefone já está cadastrado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao cadastrar o convidado." },
      { status: 500 }
    );
  }
}