import { prisma } from "@/lib/prisma";

// Helper para obter ou criar edição ativa
export async function getOrCreateActiveEdition() {
  // Buscar edição ativa
  const activeEdition = await prisma.eventEdition.findFirst({
    where: {
      ativo: true,
      arquivado: false
    }
  });

  // Se já existe, retornar
  if (activeEdition) {
    return activeEdition;
  }

  // Se não existe, criar nova edição
  const now = new Date();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const monthName = monthNames[now.getMonth()];
  const year = now.getFullYear();

  const newEdition = await prisma.eventEdition.create({
    data: {
      nome: `${monthName} ${year}`,
      descricao: `Evento de ${monthName} ${year}`,
      data_inicio: now,
      ativo: true,
      arquivado: false
    }
  });

  return newEdition;
}