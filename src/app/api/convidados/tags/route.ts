import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.convidado.findMany({
      select: {
        convidadoPor: true,
      },
      distinct: ['convidadoPor'],
      where: {
        NOT: {
          convidadoPor: null,
        },
      },
    });

    const uniqueTags = tags.map((tag: { convidadoPor: string | null }) => tag.convidadoPor).filter(Boolean) as string[];

    return NextResponse.json(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Error fetching tags' }, { status: 500 });
  }
}