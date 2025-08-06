import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Parser } from 'json2csv';

export async function GET() {
  try {
    const guests = await prisma.guest.findMany();

    if (guests.length === 0) {
      return NextResponse.json({ message: 'Nenhum convidado encontrado.' }, { status: 404 });
    }

    const fields = ['id', 'nome', 'email', 'telefone', 'empresa', 'cargo', 'convidado_por', 'status', 'data_cadastro'];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(guests);

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', 'attachment; filename="convidados.csv"');

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error('Erro ao gerar o CSV de convidados:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar o arquivo CSV.' }, { status: 500 });
  }
}
