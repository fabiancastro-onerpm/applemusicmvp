"use client";

import { useState, useRef, useEffect } from 'react';
import { Music, Headphones, Play, Pause, Volume2 } from 'lucide-react';

interface Song {
  rank: number; songId: string; name: string; artist: string;
  album: string; artwork: string; streams: number; listeners: number;
  pct: number; previewUrl: string;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

// ─── MINI AUDIO PLAYER ────────────────────────────────────────────────────────
function PreviewPlayer({
  previewUrl, songName, isActive, onActivate,
}: {
  previewUrl: string;
  songName: string;
  isActive: boolean;
  onActivate: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Pause when another song is activated
  useEffect(() => {
    if (!isActive && playing) {
      audioRef.current?.pause();
      setPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (!isActive) {
      onActivate();
      audio.currentTime = 0;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-200" title="No preview available">
        <Volume2 className="w-3.5 h-3.5" />
      </div>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <button
        onClick={togglePlay}
        title={playing ? `Pause preview: ${songName}` : `Preview: ${songName}`}
        className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shrink-0 ${
          playing
            ? 'bg-onerpm-orange text-white shadow-lg shadow-orange-200'
            : 'bg-gray-100 hover:bg-orange-50 text-gray-400 hover:text-onerpm-orange'
        }`}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        {/* Progress ring */}
        {playing && (
          <svg className="absolute inset-0 w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16" cy="16" r="13"
              fill="none" stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray={`${(progress / 100) * 81.7} 81.7`}
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TopSongs({ data, totalStreams }: { data: Song[]; totalStreams: number }) {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

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
          <p className="text-sm text-gray-500 mt-1">Ranked by Apple Music streams · click ▶ to preview</p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          {data.length} tracks
        </span>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[28px_32px_1fr_90px_90px_90px] gap-3 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span></span>
          <span>#</span>
          <span>Song</span>
          <span className="text-right">Streams</span>
          <span className="text-right">Listeners</span>
          <span className="text-right">Share</span>
        </div>

        {data.map((song) => (
          <div
            key={song.songId}
            className={`grid grid-cols-[28px_32px_1fr_90px_90px_90px] gap-3 px-3 py-3 rounded-xl transition-colors group items-center ${
              activePreviewId === song.songId ? 'bg-orange-50' : 'hover:bg-gray-50'
            }`}
          >
            {/* Preview button */}
            <PreviewPlayer
              previewUrl={song.previewUrl}
              songName={song.name}
              isActive={activePreviewId === song.songId}
              onActivate={() => setActivePreviewId(song.songId)}
            />

            {/* Rank */}
            <span className={`text-sm font-black ${song.rank <= 3 ? 'text-onerpm-orange' : 'text-gray-300'}`}>
              {song.rank}
            </span>

            {/* Song Info */}
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
                <p className={`font-bold text-sm truncate transition-colors ${
                  activePreviewId === song.songId ? 'text-onerpm-orange' : 'text-gray-900 group-hover:text-onerpm-orange'
                }`}>
                  {song.name}
                </p>
                {song.album && <p className="text-xs text-gray-400 truncate">{song.album}</p>}
              </div>
            </div>

            {/* Streams */}
            <span className="text-sm font-bold text-gray-900 text-right">{fmt(song.streams)}</span>

            {/* Listeners */}
            <span className="text-sm text-gray-500 text-right flex items-center justify-end gap-1">
              <Headphones className="w-3 h-3 text-blue-400 shrink-0" />
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

      {/* Preview note */}
      <div className="mt-5 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-4">
        <Play className="w-3 h-3 text-onerpm-orange" />
        30-second previews courtesy of Apple Music / iTunes. Click any ▶ button to listen.
      </div>
    </div>
  );
}
