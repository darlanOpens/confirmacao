import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildInviteUrl } from "@/lib/invite";

// Editar um convidado pelo e-mail
export async function PUT(
  request: Request,
  context: { params: Promise<{ email: string }> }
) {
  try {
    const params = await context.params;
    const rawEmail = params.email;
    const email = decodeURIComponent(rawEmail);

    const body = await request.json();
    const {
      nome,
      telefone,
      empresa,
      cargo,
      convidado_por,
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
      telefone,
      empresa,
      cargo,
      convidado_por,
      convite_url: buildInviteUrl(email, convidado_por),
      ...maybe("nome_preferido", nome_preferido),
      ...maybe("linkedin_url", linkedin_url),
      ...maybe("tamanho_empresa", tamanho_empresa),
      ...maybe("setor_atuacao", setor_atuacao),
      ...maybe("produtos_servicos", produtos_servicos),
      ...maybe("faturamento_anual", faturamento_anual),
      ...maybe("modelo_negocio", modelo_negocio),
    } as const;

    const updatedGuest = await prisma.guest.update({
      where: { email },
      data,
    });

    return NextResponse.json({ success: true, guest: updatedGuest });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Convidado não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Falha ao atualizar o convidado." },
      { status: 500 }
    );
  }
}
