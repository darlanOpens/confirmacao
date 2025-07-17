import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.guest.findMany({
      select: {
        convidado_por: true,
      },
      distinct: ['convidado_por'],
    });

    const uniqueTags = tags.map((tag: { convidado_por: string }) => tag.convidado_por).filter(Boolean) as string[];

    return NextResponse.json(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Error fetching tags' }, { status: 500 });
  }
}