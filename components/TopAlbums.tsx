"use client";

import { Disc3, Headphones, Calendar } from 'lucide-react';

interface Album {
  rank: number; albumId: string; name: string; artist: string;
  artwork: string; releaseDate: string; streams: number; listeners: number;
  pct: number; genre: string; trackCount: number;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtFull = (n: number) => new Intl.NumberFormat('en-US').format(n);

export default function TopAlbums({ data }: { data: Album[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Disc3 className="w-6 h-6 text-onerpm-orange" /> Top Albums
        </h3>
        <p className="text-sm text-gray-400 text-center py-12">No album data available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Disc3 className="w-6 h-6 text-onerpm-orange" />
            Top Albums
          </h3>
          <p className="text-sm text-gray-500 mt-1">Ranked by Apple Music streams</p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          {data.length} releases
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map((album) => (
          <div
            key={album.albumId}
            className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 bg-white"
          >
            {/* Artwork */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              {album.artwork ? (
                <img
                  src={album.artwork}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 className="w-16 h-16 text-gray-300" />
                </div>
              )}
              {/* Rank badge */}
              <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg ${album.rank <= 3 ? 'bg-onerpm-orange text-white' : 'bg-white/90 text-gray-700'}`}>
                {album.rank}
              </div>
              {/* Stats overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-end p-4">
                <div className="text-white w-full">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-white/60 text-xs font-medium">Streams</p>
                      <p className="font-black">{fmt(album.streams)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs font-medium">Listeners</p>
                      <p className="font-black">{fmt(album.listeners)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="font-bold text-gray-900 text-sm truncate">{album.name}</p>
              {album.genre && <p className="text-xs text-gray-400 mt-0.5">{album.genre}</p>}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Headphones className="w-3 h-3" />
                  <span className="font-medium">{fmt(album.streams)}</span>
                </div>
                {album.releaseDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{album.releaseDate.slice(0, 4)}</span>
                  </div>
                )}
              </div>
              {/* Stream bar */}
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-onerpm-orange rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(album.pct * 3, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
