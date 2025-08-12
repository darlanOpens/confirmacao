interface WebhookPayload {
  event: string;
  timestamp: string;
  body: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    empresa: string;
    cargo: string;
    convidado_por: string;
    status: string;
    data_cadastro: string;
  };
}

export async function sendGuestAddedWebhook(guestData: {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  convidado_por: string;
  status: string;
  data_cadastro: Date;
}): Promise<void> {
  console.log('🔍 Iniciando envio de webhook...');
  
  // Usar a URL do webhook da variável de ambiente ou fallback para a URL existente
  const webhookUrl = process.env.WEBHOOK_URL || "https://n8n.opens.com.br/webhook/elga-guests";
  
  const payload: WebhookPayload = {
    event: 'guest_added',
    timestamp: new Date().toISOString(),
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