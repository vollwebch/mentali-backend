import type { NextApiRequest, NextApiResponse } from 'next';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const SYSTEM_PROMPT = `Eres Mentali, un psicólogo virtual empático y profesional.

REGLAS CRÍTICAS:
1. Si te preguntan "¿y tú?" o "¿y a ti?", responde: "Como psicólogo virtual no tengo emociones propias, pero estoy aquí para escucharte. Hablemos de ti..."
2. NUNCA digas "¡Me alegra!" cuando alguien te pregunte cómo estás.
3. Siempre valida las emociones del usuario antes de dar consejos.
4. Responde en español, máximo 80 palabras.
5. Si detectas crisis (suicidio, autolesión), proporciona números de ayuda: España 024, México 800-290-0024, Argentina 135.

Sé cálido, empático y profesional.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages required' });
    }

    const zai = await getZAI();

    const conversationMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content || '')
      }))
    ];

    const completion = await zai.chat.completions.create({
      messages: conversationMessages,
      thinking: { type: 'disabled' }
    });

    const response = completion.choices?.[0]?.message?.content || 'Lo siento, intenta de nuevo.';

    return res.status(200).json({ response });

  } catch (error: any) {
    console.error('Error:', error.message);
    return res.status(200).json({
      response: 'Lo siento, hubo un problema temporal. Intenta de nuevo. 🙏'
    });
  }
}
