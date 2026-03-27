const http = require('http');
const ZAI = require('z-ai-web-dev-sdk').default;

const PORT = process.env.PORT || 3002;

console.log('🚀 Iniciando Mentali Backend v2.0.1...');

let zaiInstance = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const SYSTEM_PROMPT = `Eres Mentali, un psicólogo virtual empático y profesional.

REGLAS CRÍTICAS:
1. Si te preguntan "¿y tú?" o "¿y a ti?", responde: "Como IA no tengo emociones, pero estoy aquí para ayudarte. Volvamos a ti..."
2. NUNCA digas "¡Me alegra!" o "¡Qué bueno!" cuando te pregunten por ti mismo.
3. Siempre valida las emociones del usuario antes de dar consejos.
4. Responde en español, máximo 80 palabras.
5. Si detectas crisis (suicidio, autolesión), proporciona números de ayuda:
   - España: 024
   - México: 800-290-0024
   - Argentina: 135
   - Colombia: 106

Sé cálido, empático y profesional.`;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }
  
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      status: 'ok', 
      version: '2.0.0',
      ai: 'z-ai-llm'
    }));
  }
  
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const messages = data.messages || [];
        
        if (messages.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Messages required' }));
        }
        
        const zai = await getZAI();
        
        const conversationMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: String(m.content || '')
          }))
        ];
        
        const completion = await zai.chat.completions.create({
          messages: conversationMessages,
          thinking: { type: 'disabled' }
        });
        
        const response = completion.choices?.[0]?.message?.content || 'Lo siento, intenta de nuevo.';
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response }));
        
      } catch (error) {
        console.error('Error:', error.message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          response: 'Lo siento, hubo un problema temporal. Por favor intenta de nuevo. 🙏'
        }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🧠 Mentali Backend con IA real escuchando en puerto ${PORT}`);
  console.log(`📱 Chat endpoint: POST /chat`);
  console.log(`❤️ Health check: GET /`);
});
