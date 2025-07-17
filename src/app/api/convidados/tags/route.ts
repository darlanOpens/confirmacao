import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
        const tags = await prisma.guest.findMany({
      select: {
        convidadoPor: true,
      },
      distinct: ['convidadoPor'],
      where: {
        convidadoPor: {
          not: null,
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