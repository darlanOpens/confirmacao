interface WebhookPayload {
  event: string;
  timestamp: string;
  nome_evento?: string | undefined;
  body: {
    id: number;
    nome: string;
    email: string | null;
    telefone: string;
    empresa: string;
    cargo: string;
    convidado_por: string;
    status: string;
    data_cadastro: string;
    data_confirmacao?: string | null;
    nome_preferido?: string | null;
    linkedin_url?: string | null;
    tamanho_empresa?: string | null;
    setor_atuacao?: string | null;
    produtos_servicos?: string | null;
    faturamento_anual?: string | null;
    modelo_negocio?: string | null;
  };
}

interface GuestData {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  empresa: string;
  cargo: string;
  convidado_por: string;
  status: string;
  data_cadastro: Date;
  data_confirmacao?: Date | null;
  nome_preferido?: string | null;
  linkedin_url?: string | null;
  tamanho_empresa?: string | null;
  setor_atuacao?: string | null;
  produtos_servicos?: string | null;
  faturamento_anual?: string | null;
  modelo_negocio?: string | null;
}

export async function sendGuestAddedWebhook(guestData: GuestData): Promise<void> {
  console.log('🔍 Iniciando envio de webhook...');
  
  // Usar a URL do webhook da variável de ambiente ou fallback para a URL existente
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('❌ WEBHOOK_URL não configurada. Ignorando envio do webhook de guest_added.');
    return;
  }
  
  const payload: WebhookPayload = {
    event: 'guest_added',
    timestamp: new Date().toISOString(),
    nome_evento: process.env.NOME_EVENTO,
    body: {
      id: guestData.id,
      nome: guestData.nome,
      email: guestData.email,
      telefone: guestData.telefone,
      empresa: guestData.empresa,
      cargo: guestData.cargo,
      convidado_por: guestData.convidado_por,
      status: guestData.status,
      data_cadastro: guestData.data_cadastro.toISOString(),
      nome_preferido: guestData.nome_preferido || null,
      linkedin_url: guestData.linkedin_url || null,
      tamanho_empresa: guestData.tamanho_empresa || null,
      setor_atuacao: guestData.setor_atuacao || null,
      produtos_servicos: guestData.produtos_servicos || null,
      faturamento_anual: guestData.faturamento_anual || null,
      modelo_negocio: guestData.modelo_negocio || null,
    },
  };

  try {
    console.log('📤 Enviando webhook...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Brunch-Experience-Guest-System/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook falhou com status: ${response.status}, resposta: ${errorText}`);
    }

    console.log('✅ Webhook enviado com sucesso!');
  } catch (error) {
    // Log do erro mas não falha a operação principal
    console.error('❌ Erro ao enviar webhook:', error);
  }

} 

interface PreselectionData {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  empresa: string;
  cargo: string;
  status: string;
  data_cadastro: Date;
}

export async function sendGuestConfirmedWebhook(guestData: GuestData): Promise<void> {
  console.log('🔍 Iniciando envio de webhook de confirmação...');
  
  // Usar a URL do webhook da variável de ambiente
  const webhookUrl = process.env.WEBHOOK_GUEST_CONFIRMED_URL;
  if (!webhookUrl) {
    console.error('❌ WEBHOOK_GUEST_CONFIRMED_URL não configurada. Ignorando envio do webhook de confirmação.');
    return;
  }
  
  // Payload simplificado focando no body com dados essenciais
  const payload = {
    telefone: guestData.telefone,
    nome: guestData.nome,
    email: guestData.email,
    empresa: guestData.empresa,
    cargo: guestData.cargo,
    convidado_por: guestData.convidado_por,
    status: guestData.status,
    form_title: process.env.NOME_EVENTO || 'Brunch Experience',
    form_id: 'guest_confirmation',
    timestamp: new Date().toISOString(),
    data_confirmacao: guestData.data_confirmacao ? guestData.data_confirmacao.toISOString() : null,
    nome_preferido: guestData.nome_preferido,
    linkedin_url: guestData.linkedin_url,
    tamanho_empresa: guestData.tamanho_empresa,
    setor_atuacao: guestData.setor_atuacao,
    produtos_servicos: guestData.produtos_servicos,
    faturamento_anual: guestData.faturamento_anual,
    modelo_negocio: guestData.modelo_negocio
  };

  try {
    console.log('📤 Enviando webhook de confirmação...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Brunch-Experience-Guest-System/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook de confirmação falhou com status: ${response.status}, resposta: ${errorText}`);
    }

    console.log('✅ Webhook de confirmação enviado com sucesso!');
  } catch (error) {
    // Log do erro mas não falha a operação principal
    console.error('❌ Erro ao enviar webhook de confirmação:', error);
  }
}

export async function sendPreselectionPromotedWebhook(params: { preselection: PreselectionData; guest: GuestData }): Promise<void> {
  const { preselection, guest } = params;

  const webhookUrl = process.env.WEBHOOK_PRESELECTION_PROMOTED_URL;
  if (!webhookUrl) {
    console.error('❌ WEBHOOK_PRESELECTION_PROMOTED_URL não configurada. Ignorando envio do webhook de promoção.');
    return;
  }

  const payload = {
    event: 'preselection_promoted',
    timestamp: new Date().toISOString(),
    nome_evento: process.env.NOME_EVENTO,
    body: {
      preselection: {
        id: preselection.id,
        nome: preselection.nome,
        email: preselection.email,
        telefone: preselection.telefone,
        empresa: preselection.empresa,
        cargo: preselection.cargo,
        status: preselection.status,
        data_cadastro: preselection.data_cadastro.toISOString(),
      },
      guest: {
        id: guest.id,
        nome: guest.nome,
        email: guest.email,
        telefone: guest.telefone,
        empresa: guest.empresa,
        cargo: guest.cargo,
        convidado_por: guest.convidado_por,
        status: guest.status,
        data_cadastro: guest.data_cadastro.toISOString(),
        nome_preferido: guest.nome_preferido || null,
        linkedin_url: guest.linkedin_url || null,
        tamanho_empresa: guest.tamanho_empresa || null,
        setor_atuacao: guest.setor_atuacao || null,
        produtos_servicos: guest.produtos_servicos || null,
        faturamento_anual: guest.faturamento_anual || null,
        modelo_negocio: guest.modelo_negocio || null,
      }
    }
  } as const;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Brunch-Experience-Guest-System/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook falhou com status: ${response.status}, resposta: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar webhook de promoção:', error);
  }
}