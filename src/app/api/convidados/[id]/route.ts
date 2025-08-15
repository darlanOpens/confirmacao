import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildInviteUrl } from "@/lib/invite";

// Força a re-compilação
// Editar um convidado
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { nome, email, telefone, empresa, cargo, convidado_por } = body;
    const {
      nome_preferido,
      linkedin_url,
      tamanho_empresa,
      setor_atuacao,
      produtos_servicos,
      faturamento_anual,
      modelo_negocio,
    } = body;

    const maybe = (key: string, value: unknown) =>
      typeof value !== "undefined" && value !== null ? { [key]: value } : {};

    const data = {
      nome,
      email,
      telefone,
      empresa,
      cargo,
      convidado_por,
      convite_url: buildInviteUrl(telefone, convidado_por),
      ...maybe("nome_preferido", nome_preferido),
      ...maybe("linkedin_url", linkedin_url),
      ...maybe("tamanho_empresa", tamanho_empresa),
      ...maybe("setor_atuacao", setor_atuacao),
      ...maybe("produtos_servicos", produtos_servicos),
      ...maybe("faturamento_anual", faturamento_anual),
      ...maybe("modelo_negocio", modelo_negocio),
    } as const;

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, guest: updatedGuest });
  } catch {
    return NextResponse.json(
      { success: false, error: "Falha ao atualizar o convidado." },
      { status: 500 }
    );
  }
}

// Excluir um convidado
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);

    await prisma.guest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Falha ao excluir o convidado." },
      { status: 500 }
    );
  }
}