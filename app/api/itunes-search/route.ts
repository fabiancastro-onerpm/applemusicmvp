import { NextResponse } from 'next/server';
import { itunesSearch } from '@/lib/apple-analytics';

// GET /api/itunes-search?term=...&entity=musicArtist&limit=8
// Returns artist results enriched with artwork from their songs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term') || '';
  const entity = searchParams.get('entity') || 'musicArtist';
  const limit = parseInt(searchParams.get('limit') || '8');

  if (!term) return NextResponse.json({ results: [] });

  // Fetch both artists and songs in parallel
  const [artists, songs] = await Promise.all([
    itunesSearch(term, entity, limit),
    itunesSearch(term, 'song', 25), // get songs to extract artist artwork
  ]);

  // Build artwork map: artistId → artworkUrl from songs
  const artworkMap: Record<string, string> = {};
  for (const song of songs) {
    const aid = String(song.artistId || '');
    if (aid && !artworkMap[aid] && song.artworkUrl100) {
      artworkMap[aid] = song.artworkUrl100;
    }
  }

  // Enrich artist results with artwork
  const enriched = artists.map((a: any) => {
    const aid = String(a.artistId || '');
    const artwork = artworkMap[aid] || null;
    return {
      ...a,
      artworkUrl60: artwork ? artwork.replace('100x100', '60x60') : null,
      artworkUrl100: artwork || null,
    };
  });

  return NextResponse.json({ results: enriched });
}
