import { NextResponse } from 'next/server';
import { generateAppleDeveloperToken } from '@/lib/apple-auth';
import { parseTSV, buildHeaders, toInt, fmtN } from '@/lib/apple-analytics';

// POST /api/apple-overlap
// Body: { primaryArtistId, secondaryArtistId, startDate, endDate }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { primaryArtistId, secondaryArtistId, startDate, endDate } = body;

    if (!primaryArtistId || !secondaryArtistId) {
      return NextResponse.json({ error: 'Both primaryArtistId and secondaryArtistId are required' }, { status: 400 });
    }

    const token = generateAppleDeveloperToken();
    if (!token) {
      return NextResponse.json({ error: 'Failed to generate Apple Developer Token' }, { status: 500 });
    }

    const dateRange = {
      start: startDate || new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
      end: endDate || new Date().toISOString().split('T')[0],
      time_zone: 'UTC',
    };

    const payload = {
      primary_audience: {
        ids: { entity: 'artist_id', values: [parseInt(primaryArtistId)] },
        played_in_range: dateRange,
      },
      secondary_audience: {
        ids: { entity: 'artist_id', values: [parseInt(secondaryArtistId)] },
        played_in_range: dateRange,
      },
    };

    console.log('[Overlap] Payload:', JSON.stringify(payload));

    const res = await fetch('https://musicanalytics.apple.com/v4/queries/audience-overlap', {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    console.log('[Overlap] HTTP status:', res.status);
    console.log('[Overlap] Raw response (first 800 chars):', rawText.slice(0, 800));

    if (!res.ok) {
      return NextResponse.json(
        { error: `Apple Overlap API ${res.status}: ${rawText.slice(0, 400)}` },
        { status: res.status }
      );
    }

    const rows = parseTSV(rawText);
    console.log('[Overlap] Parsed rows:', rows.length, 'First row keys:', rows[0] ? Object.keys(rows[0]) : []);

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        debug: { rawPreview: rawText.slice(0, 400) },
        summary: null,
      });
    }

    const first = rows[0];

    // Apple might use different field names — try all known variants
    const primaryTotal =
      toInt(first.primary_audience_lc) ||
      toInt(first.primary_unique_listeners) ||
      toInt(first['primary_audience.lc']) ||
      toInt(first.primary_lc) ||
      0;

    const secondaryTotal =
      toInt(first.secondary_audience_lc) ||
      toInt(first.secondary_unique_listeners) ||
      toInt(first['secondary_audience.lc']) ||
      toInt(first.secondary_lc) ||
      0;

    const overlapCount =
      toInt(first.overlap_lc) ||
      toInt(first.overlap_unique_listeners) ||
      toInt(first['overlap.lc']) ||
      toInt(first.unique_overlap) ||
      toInt(first.intersection_lc) ||
      0;

    // Also try plays
    const primaryPlays =
      toInt(first.primary_audience_plays) ||
      toInt(first.primary_plays) ||
      0;

    const secondaryPlays =
      toInt(first.secondary_audience_plays) ||
      toInt(first.secondary_plays) ||
      0;

    const overlapPlays =
      toInt(first.overlap_plays) ||
      0;

    const overlapPct = primaryTotal > 0 ? Math.round((overlapCount / primaryTotal) * 100) : 0;

    return NextResponse.json({
      success: true,
      hasData: overlapCount > 0 || primaryTotal > 0,
      debug: {
        fields: Object.keys(first),
        rawValues: { primaryTotal, secondaryTotal, overlapCount },
        rawPreview: rawText.slice(0, 200),
      },
      summary: {
        primaryListeners: fmtN(primaryTotal),
        secondaryListeners: fmtN(secondaryTotal),
        sharedListeners: fmtN(overlapCount),
        overlapPct,
        rawPrimary: primaryTotal,
        rawSecondary: secondaryTotal,
        rawOverlap: overlapCount,
        primaryPlays,
        secondaryPlays,
        overlapPlays,
      },
      rows: rows.map(r => ({ ...r })),
    });

  } catch (err: any) {
    console.error('Overlap API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
