export async function POST(request: Request) {
  const { hint } = await request.json();
  if (!hint) return Response.json({ lang: 'en' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: `Detect the primary language of: "${hint}". Reply with ONLY the 2-letter ISO 639-1 code (en,es,fr,de,ar,zh,ja,pt,ta,hi,ml). If unsure, reply "en".`
        }],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    const data = await response.json();
    const lang = data.choices?.[0]?.message?.content?.trim().toLowerCase() || 'en';
    return Response.json({ lang });
  } catch (error) {
    console.error('Language detection error:', error);
    return Response.json({ lang: 'en' });
  }
}

