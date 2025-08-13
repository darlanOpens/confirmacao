import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      email,
      telefone,
      empresa,
      cargo,
      fonte,
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

    if (!nome || !email || !telefone || !empresa || !cargo || !fonte) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios: nome, email, telefone, empresa, cargo, fonte." },
        { status: 400 }
      );
    }

    const maybe = (key: string, value: unknown) =>
      typeof value !== "undefined" && value !== null ? { [key]: value } : {};

    const data = {
      nome,
      email,
      telefone,
      empresa,
      cargo,
      fonte,
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
    } as const;

    const newPreselection = await prisma.preselection.create({ data });

    return NextResponse.json({ success: true, preselection: newPreselection }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "Este e-mail já está cadastrado na pré-seleção." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao cadastrar na pré-seleção." },
      { status: 500 }
    );
  }
}
