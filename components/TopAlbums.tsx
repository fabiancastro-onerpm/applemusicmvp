import { useState, useRef, useEffect } from 'react';
import { Disc3, Headphones, Calendar, Play, Pause, Volume2 } from 'lucide-react';

interface Album {
  rank: number; albumId: string; name: string; artist: string;
  artwork: string; releaseDate: string; streams: number; listeners: number;
  pct: number; genre: string; trackCount: number; previewUrl?: string;
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

// ─── MINI AUDIO PLAYER (Reused from TopSongs) ──────────────────────────────────
function PreviewPlayer({
  previewUrl, albumName, isActive, onActivate,
}: {
  previewUrl: string;
  albumName: string;
  isActive: boolean;
  onActivate: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive && playing) {
      audioRef.current?.pause();
      setPlaying(false);
      setProgress(0);
    }
  }, [isActive, playing]);

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

  if (!previewUrl) return null;

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
        className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 ${
          playing 
            ? 'bg-black/40 opacity-100' 
            : 'bg-black/20 opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-2xl ${
          playing ? 'bg-orange-500 text-white scale-110' : 'bg-white/90 text-orange-500 hover:scale-110'
        }`}>
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </div>
        
        {playing && (
          <svg className="absolute w-20 h-20 -rotate-90 pointer-events-none" viewBox="0 0 40 40">
            <circle
              cx="20" cy="20" r="18"
              fill="none" stroke="white"
              strokeWidth="1.5"
              strokeDasharray={`${(progress / 100) * 113} 113`}
              strokeLinecap="round"
              className="opacity-60"
            />
          </svg>
        )}
      </button>
    </>
  );
}

export default function TopAlbums({ data }: { data: Album[] }) {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

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
          <p className="text-sm text-gray-500 mt-1">Ranked by Apple Music streams · click ▶ to preview</p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          {data.length} releases
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {data.map((album) => (
          <div
            key={album.albumId}
            className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 bg-white ${
              activePreviewId === album.albumId ? 'border-orange-500 shadow-xl shadow-orange-100 ring-1 ring-orange-500' : 'border-gray-100 hover:border-orange-200 hover:shadow-lg'
            }`}
          >
            {/* Artwork */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              {album.artwork ? (
                <img
                  src={album.artwork}
                  alt={album.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${activePreviewId === album.albumId ? 'scale-110' : 'group-hover:scale-105'}`}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 className="w-16 h-16 text-gray-300" />
                </div>
              )}
              
              {/* Rank badge */}
              <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg z-10 ${album.rank <= 3 ? 'bg-onerpm-orange text-white' : 'bg-white/90 text-gray-700'}`}>
                {album.rank}
              </div>

              {/* Preview Button */}
              {album.previewUrl && (
                <PreviewPlayer
                  previewUrl={album.previewUrl}
                  albumName={album.name}
                  isActive={activePreviewId === album.albumId}
                  onActivate={() => setActivePreviewId(album.albumId)}
                />
              )}

              {/* Stats overlay (on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white w-full">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{fmt(album.streams)} streams</span>
                    <span>{fmt(album.listeners)} listeners</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className={`font-bold text-sm truncate transition-colors ${activePreviewId === album.albumId ? 'text-orange-600' : 'text-gray-900'}`}>
                {album.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{album.genre || 'Album'}</span>
                {album.releaseDate && (
                  <span className="text-[10px] text-gray-400 font-mono">{album.releaseDate.slice(0, 4)}</span>
                )}
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-grow bg-gray-50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-onerpm-orange rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(album.pct * 4, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400">{album.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
