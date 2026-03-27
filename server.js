const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const SYSTEM_PROMPT = `Eres Mentali, un psicólogo virtual empático y profesional.

REGLAS CRÍTICAS:
1. Si te preguntan "¿y tú?" o "¿y a ti?", responde: "Como psicólogo virtual no tengo emociones propias, pero estoy aquí para escucharte. Hablemos de ti..."
2. NUNCA digas "¡Me alegra!" cuando alguien te pregunte cómo estás.
3. Siempre valida las emociones del usuario antes de dar consejos.
4. Responde en español, máximo 80 palabras.
5. Si detectas crisis (suicidio, autolesión), proporciona números de ayuda: España 024, México 800-290-0024, Argentina 135.

Sé cálido, empático y profesional.`;

// Función para hacer peticiones HTTP
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Chat con Groq API
async function chatWithGroq(messages, apiKey) {
  const postData = JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 200
  });

  const options = {
    hostname: 'api.groq.com',
    port: 443,
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const result = await makeRequest(options, postData);
  
  if (result.status !== 200) {
    throw new Error(result.data.error?.message || 'API Error');
  }

  return result.data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar eso.';
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '3.0.0', 
    ai: 'groq-llama-3.1',
    message: 'Backend listo. Obtén tu API key gratuita en https://console.groq.com/keys'
  });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages, apiKey } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages required' });
    }

    // API key del body o de las variables de entorno
    const groqApiKey = apiKey || process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(400).json({ 
        error: 'API key required',
        message: 'Obtén tu API key GRATIS en https://console.groq.com/keys y envíala en el body como "apiKey"',
        link: 'https://console.groq.com/keys'
      });
    }

    const response = await chatWithGroq(messages, groqApiKey);
    res.json({ response });

  } catch (error) {
    console.error('Error:', error.message);
    
    // Error específico de API key inválida
    if (error.message.includes('invalid') || error.message.includes('Unauthorized')) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'Tu API key no es válida. Obtén una nueva en https://console.groq.com/keys'
      });
    }

    res.status(500).json({
      error: 'Service temporarily unavailable',
      message: 'Por favor intenta de nuevo en unos momentos.'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🧠 Mentali Backend con Groq API en puerto ${PORT}`);
  console.log(`📱 Chat: POST http://localhost:${PORT}/chat`);
  console.log(`🔑 Obtén tu API key GRATIS: https://console.groq.com/keys`);
});
