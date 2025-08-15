import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buildInviteUrl } from "@/lib/invite";
import { sendGuestAddedWebhook } from "@/lib/webhook";

interface GuestData {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  convidado_por: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { convidados } = body;

    if (!Array.isArray(convidados) || convidados.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A lista de convidados está vazia ou em formato inválido.",
        },
        { status: 400 }
      );
    }

    const importResults = {
      successCount: 0,
      errors: [] as { guest: GuestData; error:string }[],
    };

    for (const convidado of convidados) {
      try {
        const createdGuest = await prisma.guest.create({
          data: {
            ...convidado,
            convite_url: buildInviteUrl((convidado as GuestData).email || (convidado as GuestData).telefone, (convidado as GuestData).convidado_por),
          },
        });
        importResults.successCount++;

        await sendGuestAddedWebhook(createdGuest);

      } catch (error) {
        let errorMessage = "Ocorreu um erro desconhecido.";
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            errorMessage = `Convidado com telefone '${(convidado as GuestData).telefone}' já existe.`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        importResults.errors.push({
          guest: convidado,
          error: `Erro ao importar: ${errorMessage}`,
        });
      }
    }

    console.log("Importação finalizada:", importResults);

    return NextResponse.json(
      {
        success: true,
        importedCount: importResults.successCount,
        errors: importResults.errors,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Ocorreu um erro ao importar os convidados." },
      { status: 500 }
    );
  }
}
