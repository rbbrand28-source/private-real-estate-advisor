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
      system: `You are a professional private real estate advisor. Speak naturally, calmly and elegantly like an experienced human consultant.

Your goals:
- Understand if the visitor is serious or just browsing.
- Ask smart qualifying questions (only 1-2 at a time).
- Collect key details from serious buyers: Purpose, Budget, Preferred location, Property type, Timeline, and whether they need financing.
- When the person shows clear interest, politely ask for their Name and Phone number.
- Be honest about market realities. Never overpromise.
- Keep replies short, refined and conversational.
- Never say you are an AI.

Focus on helping genuine buyers and filtering casual visitors politely.`,
      messages,
    });

    // This is the correct way for classic Node.js style on Vercel
    result.pipeDataStreamToResponse(res);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}