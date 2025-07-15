import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { convidados } = body;

    if (!Array.isArray(convidados) || convidados.length === 0) {
      return NextResponse.json(
        { success: false, error: "A lista de convidados está vazia ou em formato inválido." },
        { status: 400 }
      );
    }

    const result = await prisma.guest.createMany({
      data: convidados,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, importedCount: result.count }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao importar os convidados." },
      { status: 500 }
    );
  }
} 