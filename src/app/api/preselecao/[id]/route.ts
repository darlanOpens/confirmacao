import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Editar uma pré-seleção
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const {
      nome,
      email,
      telefone,
      empresa,
      cargo,
      fonte,
      status,
      prioridade,
      observacoes,
      score,
      responsavel,
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
      fonte,
      ...maybe("status", status),
      ...maybe("prioridade", prioridade),
      ...maybe("observacoes", observacoes),
      ...maybe("score", score),
      ...maybe("responsavel", responsavel),
      ...maybe("nome_preferido", nome_preferido),
      ...maybe("linkedin_url", linkedin_url),
      ...maybe("tamanho_empresa", tamanho_empresa),
      ...maybe("setor_atuacao", setor_atuacao),
      ...maybe("produtos_servicos", produtos_servicos),
      ...maybe("faturamento_anual", faturamento_anual),
      ...maybe("modelo_negocio", modelo_negocio),
      // Atualiza data_qualificacao se status mudou para qualificado
      ...(status === "qualificado" ? { data_qualificacao: new Date() } : {}),
    } as const;

    const updatedPreselection = await prisma.preselection.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, preselection: updatedPreselection });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Pré-seleção não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Falha ao atualizar a pré-seleção." },
      { status: 500 }
    );
  }
}

// Excluir uma pré-seleção
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);

    await prisma.preselection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Pré-seleção não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Falha ao excluir a pré-seleção." },
      { status: 500 }
    );
  }
}
