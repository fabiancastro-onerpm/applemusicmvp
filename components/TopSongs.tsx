"use client";

import { Music, Headphones, ExternalLink } from 'lucide-react';

interface Song {
  rank: number; songId: string; name: string; artist: string;
  album: string; artwork: string; streams: number; listeners: number;
  pct: number; previewUrl: string;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export default function TopSongs({ data, totalStreams }: { data: Song[]; totalStreams: number }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Music className="w-6 h-6 text-onerpm-orange" /> Top Songs
        </h3>
        <p className="text-sm text-gray-400 text-center py-12">No song data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Music className="w-6 h-6 text-onerpm-orange" />
            Top Songs
          </h3>
          <p className="text-sm text-gray-500 mt-1">Ranked by Apple Music streams</p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          {data.length} tracks
        </span>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[32px_1fr_90px_90px_80px] gap-3 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>#</span>
          <span>Song</span>
          <span className="text-right">Streams</span>
          <span className="text-right">Listeners</span>
          <span className="text-right">Share</span>
        </div>

        {data.map((song) => (
          <div
            key={song.songId}
            className="grid grid-cols-[32px_1fr_90px_90px_80px] gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group items-center"
          >
            {/* Rank */}
            <span className={`text-sm font-black ${song.rank <= 3 ? 'text-onerpm-orange' : 'text-gray-300'}`}>
              {song.rank}
            </span>

            {/* Song info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {song.artwork ? (
                  <img
                    src={song.artwork}
                    alt={song.name}
                    className="w-10 h-10 rounded-lg object-cover shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Music className="w-4 h-4 text-onerpm-orange" />
                  </div>
                )}
                {song.rank <= 3 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-onerpm-orange rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">{song.rank}</span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate group-hover:text-onerpm-orange transition-colors">
                  {song.name}
                </p>
                {song.album && (
                  <p className="text-xs text-gray-400 truncate">{song.album}</p>
                )}
              </div>
            </div>

            {/* Streams */}
            <span className="text-sm font-bold text-gray-900 text-right">{fmt(song.streams)}</span>

            {/* Listeners */}
            <span className="text-sm text-gray-500 text-right flex items-center justify-end gap-1">
              <Headphones className="w-3 h-3 text-blue-400" />
              {fmt(song.listeners)}
            </span>

            {/* Share bar */}
            <div className="flex items-center gap-2">
              <div className="flex-grow bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-onerpm-orange rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(song.pct, 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-400 w-8 text-right shrink-0">{song.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
