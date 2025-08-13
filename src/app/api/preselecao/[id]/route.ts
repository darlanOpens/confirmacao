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
      status,
    } = body;

    const maybe = (key: string, value: unknown) =>
      typeof value !== "undefined" && value !== null ? { [key]: value } : {};

    const data = {
      ...maybe("nome", nome),
      ...maybe("email", email),
      ...maybe("telefone", telefone),
      ...maybe("empresa", empresa),
      ...maybe("cargo", cargo),
      ...maybe("status", status),
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
