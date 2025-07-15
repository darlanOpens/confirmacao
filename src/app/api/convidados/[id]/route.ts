import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Editar um convidado
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);
    const body = await request.json();
    const { nome, email, telefone, empresa, cargo, convidado_por } = body;

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        empresa,
        cargo,
        convidado_por,
      },
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
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = parseInt(context.params.id, 10);

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