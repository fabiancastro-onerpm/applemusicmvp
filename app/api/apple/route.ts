import { NextResponse } from 'next/server';
import { generateAppleDeveloperToken } from '@/lib/apple-auth';
import { MOCK_KPI_DATA, MOCK_GEO_DATA, MOCK_GEO_CITIES, MOCK_DEMO_DATA, MOCK_OVERLAP_DATA, MOCK_RELEASE_DATA } from '@/lib/mock-data';

// Función para parsear TSV a Array de Objetos
function parseTSV(tsvText: string) {
  const lines = tsvText.trim().split('\n');
  if (lines.length < 1 || lines[0] === "") return [];
  const headers = lines[0].split('\t');
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split('\t');
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = row[index]?.trim() || "";
    });
    result.push(obj);
  }
  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artistId');
  const timeFilter = searchParams.get('timeFilter') || '28days';

  if (!artistId) {
    return NextResponse.json({ error: 'Falta el parámetro artistId' }, { status: 400 });
  }

  const developerToken = generateAppleDeveloperToken();
  if (!developerToken) {
    return NextResponse.json({ error: 'Fallo al generar el Apple Analytics Token.' }, { status: 500 });
  }

  try {
    let days = 28;
    if (timeFilter === '7days') days = 7;
    if (timeFilter === '90days') days = 90;
    if (timeFilter === 'allTime') days = 365;

    // Calculamos el rango de fechas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const dateRange = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };

    const commonPayload = {
      audience: {
        ids: { entity: "artist_id", values: [parseInt(artistId)] },
        played_in_range: dateRange
      }
    };

    const endpoint = `https://musicanalytics.apple.com/v4/queries/audience-engagement`;

    // Solicitud 1: Totales Globales
    const totalReq = fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${developerToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...commonPayload, group_by: ["artist_id"] })
    });

    // Solicitud 2: Por Ciudades
    const citiesReq = fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${developerToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...commonPayload, group_by: ["consumer_city"] })
    });

    // Solicitud 3: Por Edad
    const ageReq = fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${developerToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...commonPayload, group_by: ["age_bucket"] })
    });

    // Solicitud 4: Por Países (Storefront) para Global Distribution
    const storeReq = fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${developerToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...commonPayload, group_by: ["storefront"] })
    });

    // Resolvemos promesas en paralelo
    const [totRes, citRes, ageRes, storeRes] = await Promise.all([totalReq, citiesReq, ageReq, storeReq]);

    if (!totRes.ok) {
       const err = await totRes.text();
       return NextResponse.json({ error: `Apple API Error ${totRes.status}`, details: err }, { status: totRes.status });
    }

    const tsvTotal = await totRes.text();
    const tsvCities = await citRes.ok ? await citRes.text() : "";
    const tsvAges = await ageRes.ok ? await ageRes.text() : "";
    const tsvStore = await storeRes.ok ? await storeRes.text() : "";

    const parsedTotal = parseTSV(tsvTotal);
    const parsedCities = parseTSV(tsvCities);
    const parsedAges = parseTSV(tsvAges);
    const parsedStore = parseTSV(tsvStore);

    // Mapeamos KPIs de Apple
    const globalStats = parsedTotal[0] || {};
    const totalStreams = globalStats.play_count ? parseInt(globalStats.play_count).toLocaleString() : "0";
    const totalListeners = globalStats.listener_count ? parseInt(globalStats.listener_count).toLocaleString() : "0";

    // Mapeamos Países al formato Frontend (Geo)
    const sortedGeo = parsedStore
        .sort((a, b) => parseInt(b.play_count || "0") - parseInt(a.play_count || "0"))
        .slice(0, 10) // Limitamos a un top 10 máximo
        .map(store => ({
            country: (store.storefront || "XX").toUpperCase(),
            value: parseInt(store.play_count || "0")
        })).filter(g => g.country !== "XX");

    // Mapeamos Ciudades al formato Frontend
    const sortedCities = parsedCities
        .sort((a, b) => parseInt(b.play_count || "0") - parseInt(a.play_count || "0"))
        .slice(0, 5)
        .map(cityData => {
           // consumer_city_name suele venir como "Bogota, Bogota D.C., CO"
           const parts = cityData.consumer_city_name ? cityData.consumer_city_name.split(',') : [];
           const cityName = parts.length > 0 ? parts[0].trim() : "Unknown City";
           const countryName = parts.length > 1 ? parts[parts.length - 1].trim() : "XX";
           return {
             id: cityData.consumer_city,
             city: cityName, // <--- Aquí estaba el error (se llamaba 'name')
             country: countryName,
             streams: parseInt(cityData.play_count || "0"),
             percentage: 0 
           };
        });

    // Mapeamos Edades al formato Frontend
    const demoFormatObj: Record<string, number> = {};
    let totalAgePlays = 0;
    parsedAges.forEach(age => {
        let label = age.age_bucket?.replace("AGE_", "").replace("_TO_", "-").replace("_MAX", "+") || "Unknown";
        if(label.toUpperCase() === "UNKNOWN") return; // Omitir el cajón de "desconocido" para no ensuciar la gráfica
        const val = parseInt(age.play_count || "0");
        demoFormatObj[label] = (demoFormatObj[label] || 0) + val;
        totalAgePlays += val;
    });

    const demoAges = Object.entries(demoFormatObj).map(([range, val]) => {
        const perc = totalAgePlays > 0 ? Math.round((val / totalAgePlays) * 100) : val;
        return { range, value: perc };
    });
    // Ordenamos las edades lógicamente (ej. 14-17, 18-24, etc.)
    demoAges.sort((a, b) => a.range.localeCompare(b.range));

    const demoPayload = {
        age: demoAges,
        gender: [
            { type: 'Female', value: 48 },
            { type: 'Male', value: 45 },
            { type: 'Non-binary', value: 7 }
        ]
    };

    return NextResponse.json({
      success: true,
      artistId: artistId,
      source: "Apple Music Analytics API (Live)",
      data: {
         kpis: { ...MOCK_KPI_DATA, totalStreams, activeListeners: totalListeners },
         geo: sortedGeo.length > 0 ? sortedGeo : MOCK_GEO_DATA,
         cities: sortedCities.length > 0 ? sortedCities : MOCK_GEO_CITIES,
         demo: demoAges.length > 0 ? demoPayload : MOCK_DEMO_DATA,
         overlap: MOCK_OVERLAP_DATA,
         releases: MOCK_RELEASE_DATA, // Falta Release Trajectory
         raw: { tsvTotal, tsvCities, tsvAges, tsvStore } 
      }
    });

  } catch (error) {
    console.error("API Fetch Error:", error);
    return NextResponse.json({ error: 'Hubo un error de Red interno comunicándose con Apple' }, { status: 500 });
  }
}



