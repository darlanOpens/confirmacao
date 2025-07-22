// Servidor de teste para demonstrar o webhook
// Execute com: node test-webhook.js

const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('🎉 Webhook recebido!');
      console.log('📅 Timestamp:', new Date().toLocaleString('pt-BR'));
      console.log('📋 Payload:');
      console.log(JSON.stringify(JSON.parse(body), null, 2));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Webhook processado com sucesso' 
      }));
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Método não permitido');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando em http://localhost:${PORT}`);
  console.log(`📝 Configure WEBHOOK_URL="http://localhost:${PORT}" no seu .env`);
  console.log(`👀 Aguardando webhooks...`);
}); 