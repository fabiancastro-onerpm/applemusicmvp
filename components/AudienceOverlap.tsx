"use client";

import { useState, useCallback, useRef } from 'react';
import { Users, Zap, Search, Loader2, X, Music, Info } from 'lucide-react';

interface OverlapSummary {
  primaryListeners: string;
  secondaryListeners: string;
  sharedListeners: string;
  overlapPct: number;
  rawPrimary: number;
  rawSecondary: number;
  rawOverlap: number;
  primaryPlays?: number;
  secondaryPlays?: number;
}

interface AudienceOverlapProps {
  primaryArtistId: string;
  primaryArtistName: string;
  startDate: string;
  endDate: string;
}

// ─── ARTIST SEARCH FOR COMPARISON ────────────────────────────────────────────
function ArtistSearchInline({
  onSelect
}: { onSelect: (id: string, name: string, artwork: string) => void }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelectedInternal] = useState<{ id: string; name: string; artwork: string } | null>(null);
  const [idMode, setIdMode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/itunes-search?term=${encodeURIComponent(q)}&entity=musicArtist&limit=6`);
      const json = await res.json();
      setResults(json.results || []);
    } finally { setLoading(false); }
  }, []);

  const handleChange = (val: string) => {
    setTerm(val);
    clearTimeout(debounceRef.current);
    if (!idMode) debounceRef.current = setTimeout(() => search(val), 350);
  };

  const selectArtist = (id: string, name: string, artwork: string) => {
    const s = { id, name, artwork };
    setSelectedInternal(s);
    onSelect(id, name, artwork);
    setResults([]);
    setTerm(name);
  };

  const lookupById = async () => {
    const rawId = term.trim();
    if (!rawId || isNaN(Number(rawId))) return;
    setLoading(true);
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${rawId}&entity=musicArtist`);
      const json = await res.json();
      const artist = json.results?.find((r: any) => r.wrapperType === 'artist');
      const art = (artist?.artworkUrl100 || '').replace('100x100', '200x200');
      const name = artist?.artistName || `Artist ${rawId}`;
      selectArtist(rawId, name, art);
    } finally { setLoading(false); }
  };

  if (selected) {
    return (
      <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-2xl">
        {selected.artwork
          ? <img src={selected.artwork} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-200 shrink-0" />
          : <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><Music className="w-4 h-4 text-onerpm-orange" /></div>
        }
        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate">{selected.name}</p>
          <p className="text-xs text-gray-400 font-mono">ID: {selected.id}</p>
        </div>
        <button onClick={() => { setSelectedInternal(null); setTerm(''); }} className="text-gray-400 hover:text-gray-700 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2 mb-2">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button onClick={() => setIdMode(false)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${!idMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            🔍 Name
          </button>
          <button onClick={() => setIdMode(true)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${idMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            # ID
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-grow border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus-within:border-onerpm-orange focus-within:ring-1 focus-within:ring-onerpm-orange transition-all">
          {loading ? <Loader2 className="w-4 h-4 text-onerpm-orange animate-spin shrink-0" /> : <Search className="w-4 h-4 text-gray-400 shrink-0" />}
          <input
            value={term}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (idMode ? lookupById() : null)}
            placeholder={idMode ? 'Paste Apple Artist ID...' : 'Search artist name...'}
            className="flex-grow text-sm font-medium outline-none bg-transparent"
            type={idMode ? 'number' : 'text'}
          />
        </div>
        {idMode && (
          <button onClick={lookupById} className="px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors">
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {results.map((r: any, i) => (
            <button
              key={r.artistId || i}
              onClick={() => selectArtist(String(r.artistId), r.artistName, (r.artworkUrl100 || '').replace('100x100', '200x200'))}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-50 last:border-0"
            >
              {r.artworkUrl60
                ? <img src={r.artworkUrl60} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 shrink-0" />
                : <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><Music className="w-4 h-4 text-gray-300" /></div>
              }
              <div className="min-w-0 flex-grow">
                <p className="text-sm font-bold text-gray-900 truncate">{r.artistName}</p>
                <p className="text-xs text-gray-400">{r.primaryGenreName || 'Artist'}</p>
              </div>
              <span className="text-xs text-gray-300 font-mono shrink-0 bg-gray-50 px-2 py-1 rounded">{r.artistId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── VENN DIAGRAM ─────────────────────────────────────────────────────────────
function VennDiagram({ pct, primaryName, secondaryName, summary }: {
  pct: number; primaryName: string; secondaryName: string; summary: OverlapSummary;
}) {
  // Dynamically adjust circle overlap based on pct
  const overlapOffset = Math.max(0, 60 - Math.min(pct, 60));
  const cx1 = 90 - (overlapOffset > 30 ? 10 : 0);
  const cx2 = 150 + (overlapOffset > 30 ? 10 : 0);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative w-72 h-44">
        <svg viewBox="0 0 280 160" className="w-full h-full">
          <defs>
            <radialGradient id="g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f04f23" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f04f23" stopOpacity="0.15" />
            </radialGradient>
            <radialGradient id="g2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          <circle cx={cx1} cy="80" r="68" fill="url(#g1)" stroke="#f04f23" strokeWidth="1.5" />
          <circle cx={cx2} cy="80" r="68" fill="url(#g2)" stroke="#6366f1" strokeWidth="1.5" />
          <text x={cx1 - 20} y="80" textAnchor="middle" fontSize="9" fontWeight="700" fill="#f04f23" opacity="0.9">
            {primaryName.slice(0, 9)}
          </text>
          <text x={cx2 + 20} y="80" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6366f1" opacity="0.9">
            {secondaryName.slice(0, 9)}
          </text>
          <text x={(cx1 + cx2) / 2} y="72" textAnchor="middle" fontSize="18" fontWeight="900" fill="#1f2937">
            {pct}%
          </text>
          <text x={(cx1 + cx2) / 2} y="92" textAnchor="middle" fontSize="9" fill="#6b7280">
            shared
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="text-center p-3 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-xs text-red-400 font-bold mb-1 truncate">{primaryName.slice(0, 10)}</p>
          <p className="text-xl font-black text-gray-900">{summary.primaryListeners}</p>
          <p className="text-xs text-gray-400">listeners</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-2xl border border-orange-200">
          <p className="text-xs text-onerpm-orange font-bold mb-1">SHARED</p>
          <p className="text-xl font-black text-onerpm-orange">{summary.sharedListeners}</p>
          <p className="text-xs text-gray-400">listeners</p>
        </div>
        <div className="text-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-400 font-bold mb-1 truncate">{secondaryName.slice(0, 10)}</p>
          <p className="text-xl font-black text-gray-900">{summary.secondaryListeners}</p>
          <p className="text-xs text-gray-400">listeners</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function AudienceOverlapCard({
  primaryArtistId, primaryArtistName, startDate, endDate
}: AudienceOverlapProps) {
  const [secondaryId, setSecondaryId] = useState('');
  const [secondaryName, setSecondaryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const runOverlap = async () => {
    if (!primaryArtistId || !secondaryId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/apple-overlap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryArtistId, secondaryArtistId: secondaryId, startDate, endDate }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'API error');
      } else {
        setResult(json);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const summary = result?.summary;
  const overlapPct = summary?.overlapPct ?? 0;

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-onerpm-orange" />
            Audience Affinity (Overlap)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Shared listeners between <span className="font-bold text-gray-700">{primaryArtistName || 'this artist'}</span> and another artist
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Zap className="w-3 h-3" /> Live Data
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Compare against</p>
        <ArtistSearchInline onSelect={(id, name, artwork) => { setSecondaryId(id); setSecondaryName(name); }} />
      </div>

      <button
        onClick={runOverlap}
        disabled={!secondaryId || !primaryArtistId || loading}
        className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 rounded-2xl font-bold text-sm"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Calculating shared audience...' : 'Calculate Audience Overlap'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600 font-bold mb-1">Error</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {result && summary && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <VennDiagram
            pct={overlapPct}
            primaryName={primaryArtistName}
            secondaryName={secondaryName}
            summary={summary}
          />

          {/* Insight */}
          <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-black text-onerpm-orange text-base">{overlapPct}%</span>{' '}
              of <span className="font-bold">{primaryArtistName}</span>&apos;s listeners also played{' '}
              <span className="font-bold">{secondaryName}</span>{' — '}
              {overlapPct >= 40
                ? '🔥 Very strong affinity! Cross-promotion and joint campaigns highly recommended.'
                : overlapPct >= 20
                ? '👍 Moderate affinity. Good candidate for collaborative playlists and campaigns.'
                : overlapPct > 0
                ? '💡 Low overlap — distinct fanbases. Cross-exposure could drive new reach.'
                : '⚠️ No measurable shared audience in this date range. Try expanding the period or verifying the Apple Artist IDs.'}
            </p>
          </div>

          {/* Debug panel — visible when 0% */}
          {(overlapPct === 0 || showDebug) && result.debug && (
            <div className="mt-4">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2"
              >
                <Info className="w-3 h-3" />
                {showDebug ? 'Hide' : 'Show'} API debug info
              </button>
              {showDebug && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono overflow-auto max-h-48">
                  <p className="text-gray-500 mb-2 font-sans font-bold">API response fields:</p>
                  <p className="text-gray-600 mb-2">{result.debug.fields?.join(', ')}</p>
                  <p className="text-gray-500 mb-1 font-sans font-bold">Raw values:</p>
                  <pre className="text-gray-700">{JSON.stringify(result.debug.rawValues, null, 2)}</pre>
                  <p className="text-gray-500 mt-2 mb-1 font-sans font-bold">Raw preview:</p>
                  <pre className="text-gray-600 whitespace-pre-wrap break-all">{result.debug.rawPreview}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
