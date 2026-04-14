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
    console.log('[Overlap] Raw response (first 1200 chars):', rawText.slice(0, 1200));

    if (!res.ok) {
      return NextResponse.json(
        { error: `Apple Overlap API ${res.status}: ${rawText.slice(0, 400)}` },
        { status: res.status }
      );
    }

    const rows = parseTSV(rawText);
    console.log('[Overlap] Parsed rows:', rows.length);
    if (rows[0]) {
      console.log('[Overlap] Fields:', Object.keys(rows[0]));
      console.log('[Overlap] Values:', JSON.stringify(rows[0]));
    }

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        debug: { rawPreview: rawText.slice(0, 600) },
        summary: null,
      });
    }

    const first = rows[0];

    // ─── CORRECT FIELD MAPPING ─────────────────────────────────────────────
    // Apple's audience-overlap TSV uses these exact fields:
    //   comparison              = "artist_id X vs Y"
    //   primary_audience_lc     = unique listeners of primary artist
    //   primary_difference_lc   = listeners of primary who did NOT listen to secondary
    //   captured_lc             = SHARED/OVERLAP listeners (both artists)
    //   secondary_audience_lc   = unique listeners of secondary artist
    //   *_pc                    = play counts (not listener counts)

    const primaryTotal    = toInt(first.primary_audience_lc);
    const secondaryTotal  = toInt(first.secondary_audience_lc);
    const overlapCount    = toInt(first.captured_lc);   // THIS is the overlap!
    const primaryDiff     = toInt(first.primary_difference_lc);

    // Play counts
    const primaryPlays    = toInt(first.primary_audience_pc);
    const secondaryPlays  = toInt(first.secondary_audience_pc);
    const capturedPlays   = toInt(first.primary_captured_pc);
    const secondaryCapturedPlays = toInt(first.secondary_captured_pc);

    // Overlap percentage: shared / primary total
    const overlapPct = primaryTotal > 0
      ? Math.round((overlapCount / primaryTotal) * 100 * 10) / 10  // 1 decimal
      : 0;

    // Reverse overlap: shared / secondary total
    const reverseOverlapPct = secondaryTotal > 0
      ? Math.round((overlapCount / secondaryTotal) * 100 * 10) / 10
      : 0;

    console.log('[Overlap] Results:', { primaryTotal, secondaryTotal, overlapCount, overlapPct, reverseOverlapPct });

    return NextResponse.json({
      success: true,
      hasData: primaryTotal > 0,
      debug: {
        fields: Object.keys(first),
        rawValues: { primaryTotal, secondaryTotal, overlapCount, primaryDiff },
        rawPreview: rawText.slice(0, 300),
      },
      summary: {
        primaryListeners: fmtN(primaryTotal),
        secondaryListeners: fmtN(secondaryTotal),
        sharedListeners: fmtN(overlapCount),
        overlapPct,
        reverseOverlapPct,
        rawPrimary: primaryTotal,
        rawSecondary: secondaryTotal,
        rawOverlap: overlapCount,
        primaryDiffListeners: fmtN(primaryDiff),
        primaryPlays,
        secondaryPlays,
        capturedPlays,
        secondaryCapturedPlays,
      },
    });

  } catch (err: any) {
    console.error('Overlap API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
