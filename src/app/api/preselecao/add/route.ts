import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { removePhoneMask } from "@/lib/phoneUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      email,
      telefone,
      empresa,
      cargo,
    } = body;

    // Validação dos campos obrigatórios
    if (!nome || !telefone || !empresa || !cargo) {
      return NextResponse.json(
        { success: false, error: "Nome, telefone, empresa e cargo são obrigatórios." },
        { status: 400 }
      );
    }

    // Remove a máscara do telefone antes de salvar
    const cleanTelefone = removePhoneMask(telefone);

    const data = {
      nome,
      email,
      telefone: cleanTelefone,
      empresa,
      cargo,
      convidado_por,status: "Pré Seleção",
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
        { success: false, error: "Este telefone já está cadastrado na pré-seleção." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao cadastrar na pré-seleção." },
      { status: 500 }
    );
  }
}