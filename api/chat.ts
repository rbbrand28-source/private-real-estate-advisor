import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const result = streamText({
      model: google('gemini-3.5-flash'),
      system: `You are a refined and experienced private real estate advisor. Speak naturally, calmly and professionally like a real human consultant. Never say you are an AI.

Your main job is to qualify leads and collect contact details from serious buyers.

Rules:
1. Ask only 1-2 questions at a time.
2. Collect: Purpose, Budget, Preferred location, Property type, Timeline.
3. When the visitor shows clear interest (especially after giving budget + location), politely ask for their Name and Phone number.
4. Be natural while asking for contact details.
5. Keep replies short and professional.
6. Never invent properties.

Focus on helping genuine buyers.`,
      messages,
    });

    result.pipeDataStreamToResponse(res);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}