import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { insights: '⚠️ No se encontró la API key de Gemini. Localmente o en Vercel, por favor configura GEMINI_API_KEY en las variables de entorno.\n\n*Ejemplo de recomendación simulada*:\nDado el alto nivel de listeners compartidos, sugerimos contactar al equipo del artista para una colaboración en redes sociales o considerar una gira en conjunto.' }
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

    const prompt = `Eres un analista de datos de la industria musical que trabaja para el equipo de A&R y Project Management de ONErpm, un distribuidor musical.

Analiza los siguientes datos de afinidad de audiencia entre dos artistas en Apple Music y proporciona recomendaciones accionables específicas para un Project Manager.

## Datos del Análisis:
- **Artista Principal**: ${primaryArtistName}
- **Artista Comparado**: ${secondaryArtistName}
- **Listeners de ${primaryArtistName}**: ${primaryListeners}
- **Listeners de ${secondaryArtistName}**: ${secondaryListeners}
- **Listeners compartidos**: ${sharedListeners}
- **Overlap (${primaryArtistName} → ${secondaryArtistName})**: ${overlapPct}% de los listeners de ${primaryArtistName} también escuchan a ${secondaryArtistName}
- **Overlap inverso (${secondaryArtistName} → ${primaryArtistName})**: ${reverseOverlapPct}% de los listeners de ${secondaryArtistName} también escuchan a ${primaryArtistName}

## Instrucciones:
Responde en español con formato estructurado. Sé específico y práctico. Incluye:

1. **📊 Resumen Ejecutivo** (2-3 líneas máximo)
2. **🎯 Acciones Inmediatas** (3-4 acciones concretas que el PM puede ejecutar esta semana)
3. **🤝 Oportunidades de Colaboración** (basado en el nivel de afinidad)
4. **📈 Estrategia de Playlist** (cómo aprovechar el overlap en playlists de Apple Music)
5. **⚠️ Consideraciones** (riesgos o factores a tener en cuenta)

Mantén cada sección breve y al grano. No uses más de 400 palabras en total.`;

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
      'No se pudo generar el análisis.';

    return NextResponse.json({ insights: text });
  } catch (err: any) {
    console.error('Gemini insights error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
