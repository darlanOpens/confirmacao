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

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        empresa,
        cargo,
        convidado_por,
        convite_url: buildInviteUrl(email, convidado_por),
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