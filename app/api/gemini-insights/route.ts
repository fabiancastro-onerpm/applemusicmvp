import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { insights: '⚠️ Gemini API key not found. Locally or on Vercel, please set GEMINI_API_KEY in the environment variables.\n\n*Simulated Recommendation Example*:\nGiven the high level of shared listeners, we suggest contacting the artist\'s team for a social media collaboration or considering a joint tour.' }
    );
  }

  try {
    const body = await request.json();
    const {
      primaryArtistName,
      secondaryArtistName,
      overlapPct,
      reverseOverlapPct,
      sharedListeners,
      primaryListeners,
      secondaryListeners,
    } = body;

    const prompt = `You are a music industry data analyst working for the A&R and Project Management team at ONErpm, a music distributor.

Analyze the following audience affinity data between two artists on Apple Music and provide specific, actionable recommendations for a Project Manager.

## Analysis Data:
- **Primary Artist**: ${primaryArtistName}
- **Comparison Artist**: ${secondaryArtistName}
- **${primaryArtistName} Listeners**: ${primaryListeners}
- **${secondaryArtistName} Listeners**: ${secondaryListeners}
- **Shared Listeners**: ${sharedListeners}
- **Overlap (${primaryArtistName} → ${secondaryArtistName})**: ${overlapPct}% of ${primaryArtistName}'s listeners also listen to ${secondaryArtistName}
- **Reverse Overlap (${secondaryArtistName} → ${primaryArtistName})**: ${reverseOverlapPct}% of ${secondaryArtistName}'s listeners also listen to ${primaryArtistName}

## Instructions:
Respond in English with a structured format. Be specific and practical. Include:

1. **📊 Executive Summary** (2-3 lines max)
2. **🎯 Immediate Actions** (3-4 concrete actions the PM can execute this week)
3. **🤝 Collaboration Opportunities** (based on affinity level)
4. **📈 Playlist Strategy** (how to leverage overlap in Apple Music playlists)
5. **⚠️ Considerations** (risks or factors to keep in mind)

Keep each section brief and to the point. Do not exceed 400 words total.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status}` },
        { status: 502 }
      );
    }

    const geminiJson = await geminiRes.json();
    const text =
      geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Could not generate analysis.';

    return NextResponse.json({ insights: text });
  } catch (err: any) {
    console.error('Gemini insights error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
