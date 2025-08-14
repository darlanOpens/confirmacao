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

    return NextResponse.json(uniqueTags, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0' } });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Error fetching tags' }, { status: 500 });
  }
}