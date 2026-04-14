import { NextResponse } from 'next/server';
import { generateAppleDeveloperToken } from '@/lib/apple-auth';
import { parseTSV, buildHeaders, toInt, calcPct, fmtN } from '@/lib/apple-analytics';

// POST /api/apple-overlap
// Body: { primaryArtistId, secondaryArtistId, startDate, endDate }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { primaryArtistId, secondaryArtistId, startDate, endDate, groupBy = [] } = body;

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

    const payload: any = {
      primary_audience: {
        ids: { entity: 'artist_id', values: [parseInt(primaryArtistId)] },
        played_in_range: dateRange,
      },
      secondary_audience: {
        ids: { entity: 'artist_id', values: [parseInt(secondaryArtistId)] },
        played_in_range: dateRange,
      },
    };

    if (groupBy.length > 0) payload.group_by = groupBy;

    const res = await fetch('https://musicanalytics.apple.com/v4/queries/audience-overlap', {
      method: 'POST',
      headers: {
        ...buildHeaders(token),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Apple Overlap API ${res.status}`, details: err }, { status: res.status });
    }

    const tsv = await res.text();
    const rows = parseTSV(tsv);

    if (rows.length === 0) {
      return NextResponse.json({ success: true, hasData: false, rows: [], summary: null });
    }

    // Summary row (first row usually has totals)
    const first = rows[0];
    const primaryTotal = toInt(first.primary_audience_lc);
    const secondaryTotal = toInt(first.secondary_audience_lc);
    const overlapCount = toInt(first.overlap_lc);
    const overlapPct = primaryTotal > 0 ? Math.round((overlapCount / primaryTotal) * 100) : 0;

    // Group rows if multiple
    const grouped = rows.map(r => ({
      primaryStreams: toInt(r.primary_audience_plays),
      secondaryStreams: toInt(r.secondary_audience_plays),
      overlapStreams: toInt(r.overlap_plays),
      primaryListeners: toInt(r.primary_audience_lc),
      secondaryListeners: toInt(r.secondary_audience_lc),
      overlapListeners: toInt(r.overlap_lc),
      storefront: r.storefront,
      date: r.date,
      age: r.age_bucket,
    }));

    return NextResponse.json({
      success: true,
      hasData: overlapCount > 0,
      summary: {
        primaryListeners: fmtN(primaryTotal),
        secondaryListeners: fmtN(secondaryTotal),
        sharedListeners: fmtN(overlapCount),
        overlapPct,
        rawPrimary: primaryTotal,
        rawSecondary: secondaryTotal,
        rawOverlap: overlapCount,
      },
      rows: grouped,
    });

  } catch (err: any) {
    console.error('Overlap API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
