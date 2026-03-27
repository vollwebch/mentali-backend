// API para Vercel Serverless Functions
// Usando Groq API - GRATIS con 500,000 tokens/día

const SYSTEM_PROMPT = `Eres Mentali, un psicólogo virtual empático y profesional.

REGLAS CRÍTICAS:
1. Si te preguntan "¿y tú?" o "¿y a ti?", responde: "Como psicólogo virtual no tengo emociones propias, pero estoy aquí para escucharte. Hablemos de ti..."
2. NUNCA digas "¡Me alegra!" cuando alguien te pregunte cómo estás.
3. Siempre valida las emociones del usuario antes de dar consejos.
4. Responde en español, máximo 80 palabras.
5. Si detectas crisis (suicidio, autolesión), proporciona números de ayuda: España 024, México 800-290-0024, Argentina 135.

Sé cálido, empático y profesional.`;

async function chatWithGroq(messages, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API Error');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar eso.';
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      version: '3.0.0', 
      ai: 'groq-llama-3.1',
      message: 'Backend listo. Obtén tu API key gratuita en https://console.groq.com/keys'
    });
  }

  if (req.method === 'POST') {
    try {
      const { messages, apiKey } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages required' });
      }

      const groqApiKey = apiKey || process.env.GROQ_API_KEY;

      if (!groqApiKey) {
        return res.status(400).json({ 
          error: 'API key required',
          message: 'Obtén tu API key GRATIS en https://console.groq.com/keys',
          link: 'https://console.groq.com/keys'
        });
      }

      const response = await chatWithGroq(messages, groqApiKey);
      return res.status(200).json({ response });

    } catch (error) {
      console.error('Error:', error.message);
      
      if (error.message.includes('invalid') || error.message.includes('Unauthorized')) {
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'Tu API key no es válida. Obtén una nueva en https://console.groq.com/keys'
        });
      }

      return res.status(500).json({
        error: 'Service temporarily unavailable',
        message: 'Por favor intenta de nuevo en unos momentos.'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
