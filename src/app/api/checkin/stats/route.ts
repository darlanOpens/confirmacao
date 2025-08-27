import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Buscar estatísticas de check-in
    const totalConfirmed = await prisma.guest.count({
      where: { data_confirmacao: { not: null } }
    });

    const totalCheckedIn = await prisma.guest.count({
      where: { 
        data_confirmacao: { not: null },
        checkin_realizado: true 
      }
    });

    const totalPending = totalConfirmed - totalCheckedIn;

    // Buscar check-ins recentes (últimas 24 horas)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentCheckins = await prisma.guest.findMany({
      where: {
        checkin_realizado: true,
        data_checkin: { gte: yesterday }
      },
      select: {
        id: true,
        nome: true,
        empresa: true,
        data_checkin: true
      },
      orderBy: { data_checkin: 'desc' },
      take: 10
    });

    // Estatísticas por hora (últimas 24 horas)
    const checkinsByHour = await prisma.guest.groupBy({
      by: ['data_checkin'],
      where: {
        checkin_realizado: true,
        data_checkin: { gte: yesterday }
      },
      _count: true
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalConfirmed,
        totalCheckedIn,
        totalPending,
        percentageCheckedIn: totalConfirmed > 0 ? Math.round((totalCheckedIn / totalConfirmed) * 100) : 0
      },
      recentCheckins,
      checkinsByHour
    });

  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas de check-in:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}