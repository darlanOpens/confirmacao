import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: {
        data_cadastro: 'desc',
      },
    });
    return NextResponse.json({ success: true, guests }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao buscar os convidados." },
      { status: 500 }
    );
  }
} 