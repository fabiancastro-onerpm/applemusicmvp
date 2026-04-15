import { generateAppleDeveloperToken } from './apple-auth';

// ─── TSV PARSER ────────────────────────────────────────────────────────────────
export function parseTSV(tsvText: string): Record<string, string>[] {
  if (!tsvText || tsvText.trim() === '') return [];
  const lines = tsvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split('\t').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split('\t');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = cols[i]?.trim() || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ''));
}

// ─── APPLE API FETCH ───────────────────────────────────────────────────────────
const APPLE_ENDPOINT = 'https://musicanalytics.apple.com/v4/queries';
const CONTENT_PROVIDER_ID = process.env.APPLE_CONTENT_PROVIDER_ID || '293764';

export function buildHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Apple-MusicAnalytics-ContentProviderID': CONTENT_PROVIDER_ID,
  };
}

export async function queryAudienceEngagement(
  token: string,
  payload: object
): Promise<string> {
  const res = await fetch(`${APPLE_ENDPOINT}/audience-engagement`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Apple API ${res.status}: ${err}`);
  }
  return res.text();
}

export async function queryAudienceOverlap(
  token: string,
  payload: object
): Promise<string> {
  const res = await fetch(`${APPLE_ENDPOINT}/audience-overlap`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Apple Overlap API ${res.status}: ${err}`);
  }
  return res.text();
}

// ─── SAFE FETCH (nunca tira error, retorna '' si falla) ───────────────────────
export async function safeQuery(token: string, payload: object): Promise<string> {
  try {
    return await queryAudienceEngagement(token, payload);
  } catch (err: any) {
    console.error("Apple Analytics Query Failed:", err.message);
    throw err;
  }
}

// ─── ITUNES ENRICHMENT ─────────────────────────────────────────────────────────
export async function itunesLookup(ids: (string | number)[], entity: 'song' | 'album' | 'artist' | 'musicArtist') {
  if (!ids || ids.length === 0) return {};
  try {
    const chunks: string[][] = [];
    const cleanIds = ids.map(String).filter(Boolean);
    for (let i = 0; i < cleanIds.length; i += 50) chunks.push(cleanIds.slice(i, i + 50));
    const results: Record<string, any> = {};
    await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const res = await fetch(
            `https://itunes.apple.com/lookup?id=${chunk.join(',')}&entity=${entity}&limit=200`,
            { cache: 'force-cache' }
          );
          if (!res.ok) return;
          const json = await res.json();
          (json.results || []).forEach((item: any) => {
            const id = String(item.trackId || item.collectionId || item.artistId || '');
            if (id) {
              if (!results[id]) results[id] = item;
              else if (!results[id].previewUrl && item.previewUrl) results[id].previewUrl = item.previewUrl;
            }
            if (item.wrapperType === 'track' && item.collectionId && item.previewUrl) {
              const cId = String(item.collectionId);
              if (results[cId] && !results[cId].previewUrl) results[cId].previewUrl = item.previewUrl;
            }
          });
        } catch {}
      })
    );
    return results;
  } catch {
    return {};
  }
}

export async function itunesSearch(term: string, entity: string = 'musicArtist', limit = 8) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}&media=music`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.results || [];
  } catch {
    return [];
  }
}

// ─── FORMATTERS ────────────────────────────────────────────────────────────────
export function fmtN(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

export function toInt(s: string | undefined) {
  const n = parseInt(s || '0');
  return isNaN(n) ? 0 : n;
}

export function calcPct(val: number, total: number) {
  if (total === 0) return 0;
  return Math.round((val / total) * 100);
}

// ─── TYPE ─────────────────────────────────────────────────────────────────────
export interface AudiencePayload {
  played_in_range?: { start: string; end: string; time_zone: string };
  ids?: { entity: string; values: number[] };
  filter_by?: Record<string, string[]>;
}

export function buildAudience(
  artistId: string | null,
  dateRange: { start: string; end: string }
): AudiencePayload {
  const aud: AudiencePayload = {
    played_in_range: { ...dateRange, time_zone: 'UTC' },
  };
  if (artistId) {
    aud.ids = { entity: 'artist_id', values: [parseInt(artistId)] };
  }
  return aud;
}
