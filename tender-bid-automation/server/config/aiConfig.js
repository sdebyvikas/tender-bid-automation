import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Multi-provider AI Caller (Groq -> Gemini -> OpenAI -> Fallback)
 */
export async function callLLM({ systemPrompt, userPrompt, temperature = 0.3, responseFormat = 'text' }) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Groq models in sequence
  if (groqKey && !groqKey.includes('your_groq')) {
    const groqModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'];
    for (const model of groqModels) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: model,
            messages: [
              { role: 'system', content: systemPrompt || 'You are an expert AI Tender, RFP, and Bid Management consultant.' },
              { role: 'user', content: userPrompt }
            ],
            temperature: temperature,
            ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
          },
          {
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) return content;
      } catch (err) {
        // try next model
      }
    }
  }

  // 2. Try Gemini models in sequence
  if (geminiKey && !geminiKey.includes('your_gemini')) {
    const geminiModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-2.0-flash'];
    for (const model of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await axios.post(
          geminiUrl,
          {
            contents: [
              {
                parts: [
                  { text: `${systemPrompt ? `[SYSTEM INSTRUCTIONS]:\n${systemPrompt}\n\n` : ''}${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              temperature: temperature,
              ...(responseFormat === 'json' ? { responseMimeType: 'application/json' } : {})
            }
          },
          { timeout: 30000 }
        );

        const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) return content;
      } catch (err) {
        // try next
      }
    }
  }

  // 3. Try OpenAI
  if (openaiKey && !openaiKey.includes('your_openai')) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt || 'You are an expert AI Tender and Bid Management consultant.' },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
          ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      const content = response.data?.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      // ignore
    }
  }

  throw new Error('No working AI provider configured or quota reached.');
}
