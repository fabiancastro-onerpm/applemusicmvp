import { NextResponse } from 'next/server';
import { itunesSearch } from '@/lib/apple-analytics';

// GET /api/itunes-search?term=...&entity=musicArtist&limit=8
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term') || '';
  const entity = searchParams.get('entity') || 'musicArtist';
  const limit = parseInt(searchParams.get('limit') || '8');

  if (!term) return NextResponse.json({ results: [] });

  const results = await itunesSearch(term, entity, limit);
  return NextResponse.json({ results });
}
