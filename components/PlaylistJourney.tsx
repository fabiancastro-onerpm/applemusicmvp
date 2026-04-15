import { useState, useEffect } from 'react';
import { Shuffle, ExternalLink, TrendingUp, Music, User, Headphones, BarChart, ListMusic, Edit2 } from 'lucide-react';

interface PlaylistTrack {
  id: string;
  name: string;
  streams: number;
  listeners: number;
  artwork?: string;
}

interface Playlist {
  id: string;
  name: string;
  curator: string;
  artwork: string;
  streams: number;
  listeners: number;
  tracks: PlaylistTrack[];
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export default function PlaylistJourney({ data }: { data: Playlist[] }) {
  const [customMeta, setCustomMeta] = useState<Record<string, {name: string, artwork: string}>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('onerpm_custom_playlists');
      if (stored) setCustomMeta(JSON.parse(stored));
    } catch {}
  }, []);

  const handleEdit = (id: string, currentName: string, currentArtwork: string) => {
    const name = prompt("Set proper title for this playlist:", currentName) || currentName;
    const artwork = prompt("Paste full image URL (e.g. from mzstatic):", currentArtwork) || currentArtwork;
    
    if (name !== currentName || artwork !== currentArtwork) {
      const updated = { ...customMeta, [id]: { name, artwork } };
      setCustomMeta(updated);
      localStorage.setItem('onerpm_custom_playlists', JSON.stringify(updated));
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Shuffle className="w-6 h-6 text-onerpm-orange" /> Playlist Journey
        </h3>
        <p className="text-sm text-gray-400 text-center py-12">No playlist data available for this period</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shuffle className="w-6 h-6 text-onerpm-orange" />
            Playlist Journey
          </h3>
          <p className="text-sm text-gray-500 mt-1">Detailed performance tracking by source and track association</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <TrendingUp className="w-3.5 h-3.5" />
            {data.length} Sources Analyzed
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((pl, i) => {
          const finalName = customMeta[pl.id]?.name || pl.name;
          const finalArtwork = customMeta[pl.id]?.artwork || pl.artwork;

          return (
          <div 
            key={pl.id} 
            className="group bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-onerpm-orange transition-colors" />

            {/* Edit Button for Missing Meta */}
            <button 
              onClick={() => handleEdit(pl.id, finalName, finalArtwork)}
              className="absolute top-3 right-3 bg-white border border-gray-200 text-gray-400 hover:text-onerpm-orange p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
              title="Manually set playlist title & cover"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Primary Info Block */}
              <div className="lg:w-1/3 flex gap-6">
                <div className="relative shrink-0">
                  {finalArtwork ? (
                    <img 
                      src={finalArtwork} 
                      alt={finalName}  
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center border border-orange-100">
                      <Music className="w-8 h-8 text-onerpm-orange" />
                    </div>
                  )}
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                    {i + 1}
                  </div>
                </div>

                <div className="min-w-0 flex-grow pt-1">
                  <a 
                    href={pl.id === 'null' ? undefined : `https://music.apple.com/playlist/${pl.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${pl.id === 'null' ? 'cursor-default' : 'hover:text-onerpm-orange'} block group/link`}
                  >
                    <h4 className="font-black text-gray-900 text-lg leading-tight truncate flex items-center gap-2">
                      {finalName}
                      {pl.id !== 'null' && <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />}
                    </h4>
                  </a>
                  <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{pl.curator}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Streams</p>
                      <p className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        <BarChart className="w-3.5 h-3.5 text-onerpm-orange" />
                        {fmt(pl.streams)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Listeners</p>
                      <p className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-orange-400" />
                        {fmt(pl.listeners)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracks in Playlist Block */}
              <div className="flex-grow bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50">
                <div className="flex items-center gap-2 mb-4">
                  <ListMusic className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracks Contributing Performance</span>
                </div>
                
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                  {pl.tracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-4 bg-white/60 p-2 rounded-xl border border-white shadow-sm">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        {track.artwork ? (
                          <img src={track.artwork} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-4 h-4 m-3 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-gray-900 truncate">{track.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <BarChart className="w-3 h-3" /> {fmt(track.streams)} plays
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Headphones className="w-3 h-3" /> {fmt(track.listeners)} listeners
                          </span>
                        </div>
                      </div>
                      {/* Performance Bar (relative to playlist total) */}
                      <div className="w-24 shrink-0 px-2 bg-gray-100/50 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-onerpm-orange rounded-full" 
                          style={{ width: `${(track.streams / pl.streams) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      <div className="mt-10 p-5 bg-gradient-to-r from-orange-50 to-transparent rounded-2xl border border-orange-100/50 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md shrink-0 border border-orange-100">
          <Shuffle className="w-5 h-5 text-onerpm-orange" />
        </div>
        <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
          <strong>Playlist Journey Intelligence</strong>: This list identifies exactly which sources are placing your artist's catalog. By mapping performance down to the track level, you can see if a playlist is a "One-Hit-Wonder" source or if it's driving cross-consumption across the entire catalog.
        </p>
      </div>
    </div>
  );
}
