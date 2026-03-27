import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `Eres Mentali, un psicólogo virtual cálido y profesional.

REGLAS:
1. Si preguntan "¿y tú?" - responde que como IA no tienes emociones pero estás para escucharles.
2. NUNCA digas "¡Me alegra!" cuando te pregunten por ti.
3. Valida emociones antes de aconsejar.
4. Español, empático, máximo 60 palabras.
5. Crisis: España 024, México 800-290-0024, Argentina 135.`;

let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) zaiInstance = await ZAI.create();
  return zaiInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', ai: 'z-ai-real' });
  }

  if (req.method === 'POST') {
    try {
      const { messages } = req.body;
      if (!messages?.length) return res.status(400).json({ error: 'Messages required' });

      const zai = await getZAI();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: any) => ({ role: m.role, content: String(m.content || '') }))
        ],
        thinking: { type: 'disabled' }
      });

      return res.status(200).json({ response: completion.choices?.[0]?.message?.content || 'Lo siento, intenta de nuevo.' });
    } catch (e: any) {
      return res.status(200).json({ response: 'Lo siento, hubo un problema. Intenta de nuevo. 🙏' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
