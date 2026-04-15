import { NextResponse } from 'next/server';
import { generateAppleDeveloperToken } from '@/lib/apple-auth';
import {
  parseTSV, safeQuery, itunesLookup, itunesSearch,
  buildAudience, buildHeaders, toInt, calcPct, fmtN,
  queryAudienceEngagement
} from '@/lib/apple-analytics';

// ─── POST /api/apple ──────────────────────────────────────────────────────────
// Body: { artistId?: string, startDate: string, endDate: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artistId, startDate, endDate } = body;

    const token = generateAppleDeveloperToken();
    if (!token) {
      return NextResponse.json({ error: 'Failed to generate Apple Developer Token' }, { status: 500 });
    }

    const dateRange = {
      start: startDate || new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
      end: endDate || new Date().toISOString().split('T')[0],
    };

    const audience = buildAudience(artistId || null, dateRange);
    const base = { audience };

    // ── 14 parallel queries ──────────────────────────────────────────────────
    const [
      tsvTotal,        // group_by artist_id  → KPIs
      tsvTimeSeries,   // group_by date        → time series
      tsvStorefront,   // group_by storefront  → global distribution
      tsvCities,       // group_by consumer_city
      tsvAge,          // group_by age_bucket
      tsvGender,       // group_by gender
      tsvSongs,        // group_by song_id
      tsvAlbums,       // group_by album_id
      tsvSourceStream, // group_by source_of_stream
      tsvDeviceOS,     // group_by device_os
      tsvAudioFmt,     // group_by audio_format
      tsvEndReason,    // group_by end_reason_type
      tsvContainerType,// group_by container_type
      tsvSubscription, // group_by subscription_type
      tsvPlaylists,    // group_by container_id (filtered by PLAYLIST)
    ] = await Promise.all([
      safeQuery(token, { ...base, group_by: ['artist_id'] }),
      safeQuery(token, { ...base, group_by: ['date'] }),
      safeQuery(token, { ...base, group_by: ['storefront'] }),
      safeQuery(token, { ...base, group_by: ['consumer_city'] }),
      safeQuery(token, { ...base, group_by: ['age_bucket'] }),
      safeQuery(token, { ...base, group_by: ['gender'] }),
      safeQuery(token, { ...base, group_by: ['song_id'] }),
      safeQuery(token, { ...base, group_by: ['album_id'] }),
      safeQuery(token, { ...base, group_by: ['source_of_stream'] }),
      safeQuery(token, { ...base, group_by: ['device_os'] }),
      safeQuery(token, { ...base, group_by: ['audio_format'] }),
      safeQuery(token, { ...base, group_by: ['end_reason_type'] }),
      safeQuery(token, { ...base, group_by: ['container_type'] }),
      safeQuery(token, { ...base, group_by: ['subscription_type'] }),
      safeQuery(token, {
        audience: {
          ...base.audience,
          filter_by: { container_type: ['PLAYLIST'] }
        },
        group_by: ['container_id', 'song_id']
      }),
    ]);

    // ── Parse all TSVs ───────────────────────────────────────────────────────
    const rowTotal        = parseTSV(tsvTotal);
    const rowTimeSeries   = parseTSV(tsvTimeSeries);
    const rowStorefront   = parseTSV(tsvStorefront);
    const rowCities       = parseTSV(tsvCities);
    const rowAge          = parseTSV(tsvAge);
    const rowGender       = parseTSV(tsvGender);
    const rowSongs        = parseTSV(tsvSongs);
    const rowAlbums       = parseTSV(tsvAlbums);
    const rowSource       = parseTSV(tsvSourceStream);
    const rowDeviceOS     = parseTSV(tsvDeviceOS);
    const rowAudioFmt     = parseTSV(tsvAudioFmt);
    const rowEndReason    = parseTSV(tsvEndReason);
    const rowContainer    = parseTSV(tsvContainerType);
    const rowSubscription = parseTSV(tsvSubscription);
    const rowPlaylistSongs = parseTSV(tsvPlaylists);

    // ── KPIs ────────────────────────────────────────────────────────────────
    const g = rowTotal[0] || {};
    const totalStreams   = toInt(g.play_count);
    const totalListeners = toInt(g.listener_count);
    const hasData = totalStreams > 0;

    // ── Pre-process Playlists for Song IDs ──────────────────────────────────
    const playlistMap: Record<string, any[]> = {};
    for (const r of rowPlaylistSongs) {
      if (!playlistMap[r.container_id]) playlistMap[r.container_id] = [];
      playlistMap[r.container_id].push({
        id: r.song_id,
        name: r.song_name || `Song ${r.song_id}`,
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
      });
    }

    const topPlaylists = Object.entries(playlistMap)
      .map(([id, tracks]) => ({
        id,
        tracks: tracks.sort((a, b) => b.streams - a.streams),
        streams: tracks.reduce((s, t) => s + t.streams, 0),
        listeners: tracks.reduce((s, t) => s + t.listeners, 0),
      }))
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 15);

    // ── iTunes lookups for songs & albums (parallel) ──────────────────────
    const topSongRows  = rowSongs.sort((a, b) => toInt(b.play_count) - toInt(a.play_count)).slice(0, 20);
    const topAlbumRows = rowAlbums.sort((a, b) => toInt(b.play_count) - toInt(a.play_count)).slice(0, 12);

    const songIds = Array.from(new Set([
      ...topSongRows.map(r => r.song_id),
      ...topPlaylists.flatMap(p => p.tracks.map(t => t.id))
    ])).filter(Boolean);
    const albumIds = topAlbumRows.map(r => r.album_id).filter(Boolean);

    // Artist name from iTunes
    const itunesArtistSearch = artistId
      ? fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=musicArtist`).then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }))
      : Promise.resolve({ results: [] });

    const [songMeta, albumMeta, itunesArtistRes, itunesPlaylistRes] = await Promise.all([
      itunesLookup(songIds, 'song'),
      itunesLookup(albumIds, 'song'),
      itunesArtistSearch,
      itunesLookup(topPlaylists.map(r => r.id), 'album')
    ]);

    const artistName = (itunesArtistRes.results?.[0]?.artistName) || 'Unknown Artist';
    const artistArtwork = (itunesArtistRes.results?.[0]?.artworkUrl100 || '').replace('100x100', '600x600');

    // ── Time Series ────────────────────────────────────────────────────────
    const timeSeries = rowTimeSeries
      .filter(r => r.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({
        date: r.date,
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
      }));

    // ── Global Distribution (Top 20) ────────────────────────────────────────
    const geo = rowStorefront
      .sort((a, b) => toInt(b.play_count) - toInt(a.play_count))
      .slice(0, 20)
      .map(r => ({
        country: (r.storefront || 'XX').toUpperCase(),
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
        pct: calcPct(toInt(r.play_count), totalStreams),
      }))
      .filter(r => r.country !== 'XX' && r.streams > 0);

    // ── Top Cities ──────────────────────────────────────────────────────────
    const cities = rowCities
      .sort((a, b) => toInt(b.play_count) - toInt(a.play_count))
      .slice(0, 10)
      .map(r => {
        const parts = (r.consumer_city_name || '').split(',');
        return {
          id: r.consumer_city,
          city: (parts[0] || '').trim() || 'Unknown',
          country: (parts[parts.length - 1] || '').trim() || '',
          streams: toInt(r.play_count),
          listeners: toInt(r.listener_count),
          pct: calcPct(toInt(r.play_count), totalStreams),
        };
      })
      .filter(r => r.city && r.city !== 'Unknown' && r.city !== 'null' && r.streams > 0);

    // ── Age Segmentation ────────────────────────────────────────────────────
    const ageTotalPlays = rowAge.reduce((s, r) => s + toInt(r.play_count), 0);
    const age = rowAge
      .map(r => {
        const label = (r.age_bucket || 'Unknown')
          .replace('AGE_', '').replace('_TO_', '-').replace('_MAX', '+');
        return {
          range: label === 'UNKNOWN' ? 'Unknown' : label,
          streams: toInt(r.play_count),
          listeners: toInt(r.listener_count),
          pct: calcPct(toInt(r.play_count), ageTotalPlays),
        };
      })
      .filter(r => r.range !== 'Unknown' && r.streams > 0)
      .sort((a, b) => a.range.localeCompare(b.range));

    // ── Gender Identity ─────────────────────────────────────────────────────
    const genderTotalPlays = rowGender.reduce((s, r) => s + toInt(r.play_count), 0);
    const genderMap: Record<string, string> = {
      MALE: 'Male', FEMALE: 'Female', OTHER: 'Other/Non-binary', NOT_PROVIDED: 'Not Specified',
    };
    const gender = rowGender
      .map(r => ({
        type: genderMap[r.gender?.toUpperCase() || ''] || r.gender || 'Other',
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
        pct: calcPct(toInt(r.play_count), genderTotalPlays),
      }))
      .filter(r => r.streams > 0)
      .sort((a, b) => b.streams - a.streams);

    // ── Top Songs ────────────────────────────────────────────────────────────
    const songs = topSongRows.map((r, i) => {
      const meta = songMeta[r.song_id] || {};
      return {
        rank: i + 1,
        songId: r.song_id,
        name: meta.trackName || `Song ${r.song_id}`,
        artist: meta.artistName || artistName,
        album: meta.collectionName || '',
        artwork: (meta.artworkUrl100 || '').replace('100x100', '300x300'),
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
        pct: calcPct(toInt(r.play_count), totalStreams),
        previewUrl: meta.previewUrl || '',
      };
    }).filter(r => r.streams > 0);

    // ── Top Albums ────────────────────────────────────────────────────────────
    const albums = topAlbumRows.map((r, i) => {
      const meta = albumMeta[r.album_id] || {};
      return {
        rank: i + 1,
        albumId: r.album_id,
        name: meta.collectionName || `Album ${r.album_id}`,
        artist: meta.artistName || artistName,
        artwork: (meta.artworkUrl100 || '').replace('100x100', '400x400'),
        releaseDate: meta.releaseDate || '',
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
        pct: calcPct(toInt(r.play_count), totalStreams),
        genre: meta.primaryGenreName || '',
        trackCount: meta.trackCount || 0,
        previewUrl: meta.previewUrl || '', // itunes lookup for album entity sometimes has a previewUrl if it's a collection
      };
    }).filter(r => r.streams > 0);

    // ── Source of Stream ───────────────────────────────────────────────────
    const sourceTotal = rowSource.reduce((s, r) => s + toInt(r.play_count), 0);
    const sourceLabelMap: Record<string, string> = {
      LIBRARY: 'Library', SEARCH: 'Search', DISCOVERY: 'Discovery',
      MUSIC_KIT: 'MusicKit', OTHER: 'Other'
    };
    const streamSources = rowSource
      .map(r => ({
        source: sourceLabelMap[r.source_of_stream?.toUpperCase() || ''] || r.source_of_stream || 'Other',
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
        pct: calcPct(toInt(r.play_count), sourceTotal),
      }))
      .filter(r => r.streams > 0)
      .sort((a, b) => b.streams - a.streams);

    // ── Device OS ──────────────────────────────────────────────────────────
    const deviceTotal = rowDeviceOS.reduce((s, r) => s + toInt(r.play_count), 0);
    const deviceLabelMap: Record<string, string> = {
      IOS: 'iOS', MAC: 'Mac', ANDROID: 'Android', WINDOWS: 'Windows',
      TVOS: 'Apple TV', SONOS: 'Sonos', OTHER: 'Other'
    };
    const deviceOS = rowDeviceOS
      .map(r => ({
        os: deviceLabelMap[r.device_os?.toUpperCase() || ''] || r.device_os || 'Other',
        streams: toInt(r.play_count),
        listeners: toInt(r.listener_count),
        pct: calcPct(toInt(r.play_count), deviceTotal),
      }))
      .filter(r => r.streams > 0)
      .sort((a, b) => b.streams - a.streams);

    // ── Audio Format ────────────────────────────────────────────────────────
    const audioTotal = rowAudioFmt.reduce((s, r) => s + toInt(r.play_count), 0);
    const audioLabelMap: Record<string, string> = {
      LOSSY:             'Standard (AAC)',
      COMPRESSED_AUDIO:  'Standard (AAC)',
      AAC:               'Standard (AAC)',
      LOSSLESS:          'Lossless (ALAC)',
      ALAC:              'Lossless (ALAC)',
      IMMERSIVE:         'Spatial Audio',
      DOLBY_ATMOS:       'Spatial Audio',
      SPATIAL:           'Spatial Audio',
      ATMOS:             'Spatial Audio',
    };
    // Merge duplicate labels after mapping
    const audioMerged: Record<string, number> = {};
    for (const r of rowAudioFmt) {
      const label = audioLabelMap[r.audio_format?.toUpperCase() || ''] || r.audio_format || 'Other';
      audioMerged[label] = (audioMerged[label] || 0) + toInt(r.play_count);
    }
    const audioFormat = Object.entries(audioMerged)
      .map(([format, streams]) => ({
        format,
        streams,
        pct: calcPct(streams, audioTotal),
      }))
      .filter(r => r.streams > 0)
      .sort((a, b) => b.streams - a.streams);

    // ── End Reason (Completion / Skip) ─────────────────────────────────────
    const endTotal = rowEndReason.reduce((s, r) => s + toInt(r.play_count), 0);
    const endLabelMap: Record<string, string> = {
      COMPLETE: 'Completed', SKIP: 'Skipped', MANUALLY: 'Manually Stopped',
      PAUSED: 'Paused', OTHER: 'Other'
    };
    const endReasons = rowEndReason
      .map(r => ({
        reason: endLabelMap[r.end_reason_type?.toUpperCase() || ''] || r.end_reason_type || 'Other',
        streams: toInt(r.play_count),
        pct: calcPct(toInt(r.play_count), endTotal),
      }))
      .filter(r => r.streams > 0)
      .sort((a, b) => b.streams - a.streams);

    // Completion rate KPI
    const completedRow = rowEndReason.find(r => r.end_reason_type?.toUpperCase() === 'COMPLETE');
    const completionRate = endTotal > 0 ? calcPct(toInt(completedRow?.play_count), endTotal) : null;
    const skipRate = endTotal > 0 ? calcPct(toInt(rowEndReason.find(r => r.end_reason_type?.toUpperCase() === 'SKIP')?.play_count), endTotal) : null;

    // ── Container Type (Where it's played: Playlist vs Album vs Radio) ─────
    const containerTotal = rowContainer.reduce((s, r) => s + toInt(r.play_count), 0);
    const containerLabelMap: Record<string, string> = {
      SINGLE_TRACK: 'Single Track', RADIO_STATION: 'Radio Station',
      PLAYLIST: 'Playlist', ALBUM: 'Album'
    };
    const containerTypes = rowContainer
      .map(r => ({
        type: containerLabelMap[r.container_type?.toUpperCase() || ''] || r.container_type || 'Other',
        streams: toInt(r.play_count),
        pct: calcPct(toInt(r.play_count), containerTotal),
      }))
      .filter(r => r.streams > 0)
      .sort((a, b) => b.streams - a.streams);

    // ── Subscription Type ───────────────────────────────────────────────────
    const subTotal = rowSubscription.reduce((s, r) => s + toInt(r.play_count), 0);
    const subscriptions = rowSubscription
      .map(r => ({
        type: (r.subscription_type || 'Unknown').replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
        streams: toInt(r.play_count),
        pct: calcPct(toInt(r.play_count), subTotal),
      }))
      .filter(r => r.streams > 0)
      .sort((a, b) => b.streams - a.streams);

    // ── Playlists (Journey) Redesign Logic ──────────────────────────────────

    
    // Fetch real html titles for Apple Music Playlists (starts with pl.)
    const appleMusicPlaylistTitles: Record<string, string> = {};
    const appleMusicPlaylistImages: Record<string, string> = {};
    await Promise.all(topPlaylists.map(async r => {
      if (r.id?.startsWith('pl.')) {
        try {
          // Use universal storefront or no storefront for better resolution
          const res = await fetch(`https://music.apple.com/playlist/${r.id}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            next: { revalidate: 86400 }
          });
          if (res.ok) {
            const html = await res.text();
            
            // Match Title (og:title or <title>)
            const titleMatch = html.match(/<meta property="?og:title"? content="([^"]+)"/i) || html.match(/<title>(.*?)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              appleMusicPlaylistTitles[r.id] = titleMatch[1]
                .replace(/ - Playlist - Apple Music$/, '')
                .replace(/ de Apple Music$/, '')
                .replace(/ on Apple Music$/, '')
                .trim();
            }
            // Match <meta property="og:image" content="...">
            const imgMatch = html.match(/<meta property="?og:image"? content="([^"]+)"/);
            if (imgMatch && imgMatch[1]) {
              appleMusicPlaylistImages[r.id] = imgMatch[1];
            } else {
              // Deep Scrape Fallback: Look for any mzstatic image thumb in the page (imitating DevTools Sources search)
              const deepMatch = html.match(/https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/[^"']+\/(?:1024x1024|1200x630)[^"']+/);
              if (deepMatch) {
                appleMusicPlaylistImages[r.id] = deepMatch[0];
              }
            }
          }
        } catch {}
      }
    }));

    const playlists = topPlaylists
      .map(r => {
        const isNull = !r.id || r.id === 'null';
        const meta = itunesPlaylistRes[r.id] || {};
        const htmlTitle = appleMusicPlaylistTitles[r.id];
        const htmlImage = appleMusicPlaylistImages[r.id];
        
        const playlistTracks = r.tracks.map(t => {
            const sMeta = songMeta[t.id] || {};
            return {
              ...t,
              name: sMeta.trackName || t.name,
              artwork: sMeta.artworkUrl100 || '',
            };
          });

        return {
          id: r.id,
          name: isNull ? 'Private User Playlists' : (htmlTitle || meta.collectionName || `User Generated Playlist`),
          curator: isNull ? 'Various Users' : (meta.artistName || (htmlTitle ? 'Apple Music' : 'Unknown Curator')),
          artwork: isNull ? '' : (htmlImage || (meta.artworkUrl100 || '').replace('100x100', '300x300')),
          streams: r.streams,
          listeners: r.listeners,
          tracks: playlistTracks,
        };
      })
      .filter(r => r.streams > 0);

    // ── Response ────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      hasData,
      artistId,
      artistName,
      artistArtwork,
      dateRange,
      noDataReason: !hasData
        ? `No streams found for ${artistId ? `Artist ID "${artistId}"` : 'this catalog'}. Verify the Apple Artist ID or try a wider date range.`
        : null,
      kpis: {
        totalStreams: fmtN(totalStreams),
        totalListeners: fmtN(totalListeners),
        completionRate: completionRate !== null ? `${completionRate}%` : null,
        skipRate: skipRate !== null ? `${skipRate}%` : null,
        streamsPerListener: totalListeners > 0 ? (totalStreams / totalListeners).toFixed(1) : null,
        rawStreams: totalStreams,
        rawListeners: totalListeners,
      },
      timeSeries,
      geo,
      cities,
      age,
      gender,
      songs,
      albums,
      streamSources,
      deviceOS,
      audioFormat,
      endReasons,
      containerTypes,
      subscriptions,
      playlists,
    });

  } catch (err: any) {
    console.error('Apple API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// Keep GET for backward compat
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get('artistId');
  const timeFilter = searchParams.get('timeFilter') || '28days';
  if (!artistId) return NextResponse.json({ error: 'Missing artistId' }, { status: 400 });

  const days = timeFilter === '7days' ? 7 : timeFilter === '90days' ? 90 : timeFilter === 'allTime' ? 365 : 28;
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  return POST(new Request(request.url, {
    method: 'POST',
    body: JSON.stringify({ artistId, startDate, endDate }),
    headers: { 'Content-Type': 'application/json' },
  }));
}
