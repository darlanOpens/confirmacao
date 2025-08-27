const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function insertTestData() {
  console.log('🧪 Inserindo dados de teste...');

  try {
    // Inserir convidados com diferentes status
    const guests = [
      {
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        telefone: '11999999999',
        empresa: 'Tech Solutions',
        cargo: 'Desenvolvedor',
        convidado_por: 'Maria Santos',
        status: 'Convidado',
        convite_url: 'http://localhost:3001/convite/1'
      },
      {
        nome: 'Ana Costa',
        email: 'ana.costa@email.com',
        telefone: '11888888888',
        empresa: 'Design Studio',
        cargo: 'Designer',
        convidado_por: 'Carlos Lima',
        status: 'Confirmado',
        convite_url: 'http://localhost:3001/convite/2'
      },
      {
        nome: 'Roberto Santos',
        email: 'roberto.santos@email.com',
        telefone: '11777777777',
        empresa: 'Marketing Pro',
        cargo: 'Marketing Manager',
        convidado_por: 'João Silva',
        status: 'Convidado',
        convite_url: 'http://localhost:3001/convite/3'
      },
      {
        nome: 'Carla Oliveira',
        email: 'carla.oliveira@email.com',
        telefone: '11666666666',
        empresa: 'Consultoria XYZ',
        cargo: 'Consultora',
        convidado_por: 'Ana Costa',
        status: 'Confirmado',
        convite_url: 'http://localhost:3001/convite/4'
      },

      {
        nome: 'Patricia Lima',
        email: 'patricia.lima@email.com',
        telefone: '11444444444',
        empresa: 'Innovation Labs',
        cargo: 'Product Manager',
        convidado_por: 'João Silva',
        status: 'Convidado',
        convite_url: 'http://localhost:3001/convite/6'
      },
      {
        nome: 'Fernando Costa',
        email: 'fernando.costa@email.com',
        telefone: '11333333333',
        empresa: 'Digital Agency',
        cargo: 'Diretor Criativo',
        convidado_por: 'Ana Costa',
        status: 'Confirmado',
        convite_url: 'http://localhost:3001/convite/7'
      },
      {
        nome: 'Mariana Rocha',
        email: 'mariana.rocha@email.com',
        telefone: '11222222222',
        empresa: 'Health Tech',
        cargo: 'CTO',
        convidado_por: 'Carlos Lima',
        status: 'Convidado',
        convite_url: 'http://localhost:3001/convite/8'
      },

      {
        nome: 'Beatriz Santos',
        email: 'beatriz.santos@email.com',
        telefone: '11000000000',
        empresa: 'EduTech Solutions',
        cargo: 'Educadora',
        convidado_por: 'João Silva',
        status: 'Confirmado',
        convite_url: 'http://localhost:3001/convite/10'
      }
    ];

    // Inserir convidados
    for (const guest of guests) {
      await prisma.guest.create({
        data: guest
      });
      console.log(`✅ Inserido: ${guest.nome} (${guest.status})`);
    }

    // Inserir pré-seleções
    const preselections = [
      {
        nome: 'Ricardo Alves',
        email: 'ricardo.alves@email.com',
        telefone: '12999999999',
        empresa: 'E-commerce Plus',
        cargo: 'CEO',
        status: 'Pré-seleção'
      },
      {
        nome: 'Camila Rodrigues',
        email: 'camila.rodrigues@email.com',
        telefone: '12888888888',
        empresa: 'Green Energy',
        cargo: 'Diretora de Sustentabilidade',
        status: 'Pré-seleção'
      },
      {
        nome: 'Thiago Pereira',
        email: 'thiago.pereira@email.com',
        telefone: '12777777777',
        empresa: 'Fintech Innovate',
        cargo: 'Head of Product',
        status: 'Pré-seleção'
      },
      {
        nome: 'Amanda Costa',
        email: 'amanda.costa@email.com',
        telefone: '12666666666',
        empresa: 'AI Solutions',
        cargo: 'Data Scientist',
        status: 'Pré-seleção'
      },
      {
        nome: 'Gustavo Lima',
        email: 'gustavo.lima@email.com',
        telefone: '12555555555',
        empresa: 'Logistics Pro',
        cargo: 'COO',
        status: 'Pré-seleção'
      }
    ];

    for (const preselection of preselections) {
      await prisma.preselection.create({
        data: preselection
      });
      console.log(`✅ Pré-seleção inserida: ${preselection.nome}`);
    }

    // Adicionar alguns check-ins
    console.log('\n🔄 Adicionando check-ins...');

    // Buscar alguns convidados para fazer check-in
    const guestsForCheckin = await prisma.guest.findMany({
      where: {
        status: 'Confirmado'
      },
      take: 3
    });

    for (let i = 0; i < guestsForCheckin.length; i++) {
      const guest = guestsForCheckin[i];
      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          checkin_realizado: true,
          data_checkin: new Date(),
          checkin_por: 'Sistema de Teste'
        }
      });
      console.log(`✅ Check-in realizado: ${guest.nome}`);
    }

    console.log('\n🎉 Todos os dados de teste foram inseridos com sucesso!');
    console.log('\n📊 Resumo dos dados inseridos:');
    console.log('- 8 Convidados (diversos status)');
    console.log('- 5 Pré-seleções');
    console.log('- 3 Check-ins realizados');

  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertTestData();
