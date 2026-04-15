"use client";

import { useState, useCallback, useRef } from 'react';
import { Users, Zap, Search, Loader2, X, Music, Info, TrendingUp, ArrowRight, Sparkles, Bot, ChevronDown, ChevronUp } from 'lucide-react';

interface OverlapSummary {
  primaryListeners: string;
  secondaryListeners: string;
  sharedListeners: string;
  overlapPct: number;
  reverseOverlapPct?: number;
  rawPrimary: number;
  rawSecondary: number;
  rawOverlap: number;
  primaryDiffListeners?: string;
  primaryPlays?: number;
  secondaryPlays?: number;
  capturedPlays?: number;
  secondaryCapturedPlays?: number;
}

interface AudienceOverlapProps {
  primaryArtistId: string;
  primaryArtistName: string;
  startDate: string;
  endDate: string;
}

// ─── ARTIST SEARCH ────────────────────────────────────────────────────────────
function ArtistSearchInline({
  onSelect
}: { onSelect: (id: string, name: string, artwork: string) => void }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelectedLocal] = useState<{ id: string; name: string; artwork: string } | null>(null);
  const [idMode, setIdMode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      // Search for songs by artist to get artwork
      const [artistRes, songRes] = await Promise.all([
        fetch(`/api/itunes-search?term=${encodeURIComponent(q)}&entity=musicArtist&limit=8`),
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=20&media=music`),
      ]);
      const artistJson = await artistRes.json();
      const songJson = await songRes.json();

      // Build artwork map from songs: artistId → artworkUrl
      const artworkMap: Record<string, string> = {};
      for (const song of (songJson.results || [])) {
        const aid = String(song.artistId || '');
        if (aid && !artworkMap[aid] && song.artworkUrl100) {
          artworkMap[aid] = song.artworkUrl100.replace('100x100', '200x200');
        }
      }

      // Merge artwork into artist results
      const artists = (artistJson.results || []).map((a: any) => ({
        ...a,
        artworkUrl60: artworkMap[String(a.artistId)] ?
          artworkMap[String(a.artistId)].replace('200x200', '60x60') : null,
        artworkUrl200: artworkMap[String(a.artistId)] || null,
      }));

      setResults(artists);
    } finally { setLoading(false); }
  }, []);

  const handleChange = (val: string) => {
    setTerm(val);
    clearTimeout(debounceRef.current);
    if (!idMode) debounceRef.current = setTimeout(() => search(val), 350);
  };

  const selectArtist = (id: string, name: string, artwork: string) => {
    setSelectedLocal({ id, name, artwork });
    onSelect(id, name, artwork);
    setResults([]);
    setTerm(name);
  };

  const lookupById = async () => {
    const rawId = term.trim();
    if (!rawId || isNaN(Number(rawId))) return;
    setLoading(true);
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${rawId}&entity=song&limit=5`);
      const json = await res.json();
      const artist = json.results?.find((r: any) => r.wrapperType === 'artist');
      const song = json.results?.find((r: any) => r.wrapperType === 'track' && r.artworkUrl100);
      const art = song ? song.artworkUrl100.replace('100x100', '200x200') : '';
      const name = artist?.artistName || `Artist ${rawId}`;
      selectArtist(rawId, name, art);
    } catch {
      selectArtist(rawId, `Artist ${rawId}`, '');
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
        <button onClick={() => { setSelectedLocal(null); setTerm(''); }} className="text-gray-400 hover:text-gray-700 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex gap-2 mb-2">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button onClick={() => { setIdMode(false); setResults([]); }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${!idMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            🔍 Name
          </button>
          <button onClick={() => { setIdMode(true); setResults([]); }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${idMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
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
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((r: any, i) => (
            <button
              key={r.artistId || i}
              onClick={() => selectArtist(String(r.artistId), r.artistName, r.artworkUrl200 || '')}
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
function VennDiagram({ summary, primaryName, secondaryName }: {
  summary: OverlapSummary; primaryName: string; secondaryName: string;
}) {
  const pct = summary.overlapPct;
  // Scale the circle overlap visually
  const overlapScale = Math.min(pct / 50, 1); // normalized 0-1
  const gap = 60 - (overlapScale * 50); // gap decreases with higher overlap

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative w-80 h-48">
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <defs>
            <radialGradient id="gPrimary" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f04f23" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f04f23" stopOpacity="0.12" />
            </radialGradient>
            <radialGradient id="gSecondary" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.12" />
            </radialGradient>
          </defs>
          {/* Primary circle */}
          <circle cx={100} cy="90" r="72" fill="url(#gPrimary)" stroke="#f04f23" strokeWidth="2" />
          {/* Secondary circle */}
          <circle cx={100 + gap + 60} cy="90" r="72" fill="url(#gSecondary)" stroke="#6366f1" strokeWidth="2" />
          {/* Labels */}
          <text x={70} y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f04f23">
            {primaryName.length > 10 ? primaryName.slice(0, 9) + '…' : primaryName}
          </text>
          <text x={190 + gap - 20} y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6366f1">
            {secondaryName.length > 10 ? secondaryName.slice(0, 9) + '…' : secondaryName}
          </text>
          {/* Overlap center */}
          <text x={130 + gap / 2} y="82" textAnchor="middle" fontSize="22" fontWeight="900" fill="#1f2937">
            {pct}%
          </text>
          <text x={130 + gap / 2} y="100" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
            shared
          </text>
        </svg>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-xs text-red-500 font-bold mb-1.5 truncate">{primaryName}</p>
          <p className="text-2xl font-black text-gray-900">{summary.primaryListeners}</p>
          <p className="text-xs text-gray-400 mt-0.5">listeners</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 shadow-sm">
          <p className="text-xs text-onerpm-orange font-black mb-1.5 uppercase tracking-wider">Shared</p>
          <p className="text-2xl font-black text-onerpm-orange">{summary.sharedListeners}</p>
          <p className="text-xs text-gray-400 mt-0.5">listeners in common</p>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-500 font-bold mb-1.5 truncate">{secondaryName}</p>
          <p className="text-2xl font-black text-gray-900">{summary.secondaryListeners}</p>
          <p className="text-xs text-gray-400 mt-0.5">listeners</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AudienceOverlapCard({
  primaryArtistId, primaryArtistName, startDate, endDate
}: AudienceOverlapProps) {
  const [secondaryId, setSecondaryId] = useState('');
  const [secondaryName, setSecondaryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiInsights = async () => {
    if (!summary) return;
    setAiLoading(true);
    setAiError(null);
    setShowAiPanel(true);
    try {
      const res = await fetch('/api/gemini-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryArtistName,
          secondaryArtistName: secondaryName,
          overlapPct: summary.overlapPct,
          reverseOverlapPct: summary.reverseOverlapPct ?? 0,
          sharedListeners: summary.sharedListeners,
          primaryListeners: summary.primaryListeners,
          secondaryListeners: summary.secondaryListeners,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error || 'Error al consultar Gemini');
      } else {
        setAiInsights(json.insights);
      }
    } catch (e: any) {
      setAiError(e.message || 'Error de red');
    } finally {
      setAiLoading(false);
    }
  };

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

  const summary: OverlapSummary | null = result?.summary ?? null;
  const overlapPct = summary?.overlapPct ?? 0;
  const reverseOverlapPct = summary?.reverseOverlapPct ?? 0;

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

      {/* Search */}
      <div className="mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Compare against</p>
        <ArtistSearchInline onSelect={(id, name) => { setSecondaryId(id); setSecondaryName(name); }} />
      </div>

      <button
        onClick={runOverlap}
        disabled={!secondaryId || !primaryArtistId || loading}
        className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 rounded-2xl font-bold text-sm"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Calculating shared audience...' : 'Calculate Audience Overlap'}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600 font-bold mb-1">Error</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && summary && (
        <div className="mt-6 border-t border-gray-100 pt-6 space-y-5">
          <VennDiagram summary={summary} primaryName={primaryArtistName} secondaryName={secondaryName} />

          {/* Bidirectional insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-500 uppercase">Primary → Secondary</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{overlapPct}%</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                of <span className="font-bold">{primaryArtistName}</span>&apos;s listeners also listen to <span className="font-bold">{secondaryName}</span>
              </p>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-500 uppercase">Secondary → Primary</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{reverseOverlapPct}%</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                of <span className="font-bold">{secondaryName}</span>&apos;s listeners also listen to <span className="font-bold">{primaryArtistName}</span>
              </p>
            </div>
          </div>

          {/* A&R Recommendation */}
          <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-onerpm-orange mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">A&R Recommendation</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {overlapPct >= 30
                    ? `🔥 Very strong affinity (${overlapPct}%). ${summary.sharedListeners} shared listeners make this a prime collaboration opportunity. Joint single or feature would reach an already-engaged audience.`
                    : overlapPct >= 15
                    ? `👍 Solid affinity (${overlapPct}%). ${summary.sharedListeners} shared listeners represent a meaningful audience bridge. A featured track, remix, or joint playlist placement could drive significant cross-pollination.`
                    : overlapPct >= 5
                    ? `💡 Moderate overlap (${overlapPct}%). ${summary.sharedListeners} shared listeners indicate potential for audience growth. A collaboration could introduce each artist to new fans from the other's base.`
                    : overlapPct > 0
                    ? `📊 Low but measurable overlap (${overlapPct}%). ${summary.sharedListeners} shared listeners, representing an opportunity to grow cross-exposure. Consider playlist co-placement or a shared campaign.`
                    : `⚠️ No shared audience detected in this date range. Check the date range or artist IDs.`}
                </p>
                {reverseOverlapPct > overlapPct && reverseOverlapPct > 0 && (
                  <p className="text-xs text-orange-600 font-medium mt-2">
                    💡 Note: {secondaryName} has a higher reverse affinity ({reverseOverlapPct}%), suggesting their audience is already familiar with {primaryArtistName}.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights Button & Panel */}
          <div className="relative">
            <button
              onClick={fetchAiInsights}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 disabled:opacity-60 group"
            >
              {aiLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              )}
              {aiLoading ? 'Analizando con Gemini AI...' : '✨ ¿Qué puedo hacer con esto?'}
              <span className="ml-auto text-xs opacity-70 bg-white/20 px-2 py-0.5 rounded-full">Powered by Gemini</span>
            </button>

            {showAiPanel && (
              <div className="mt-4 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-violet-100/80 to-indigo-100/80 border-b border-purple-200">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-sm text-purple-900">Análisis de Gemini AI</span>
                    <span className="text-xs bg-purple-200/60 text-purple-700 px-2 py-0.5 rounded-full font-medium">Gemini 2.5 Flash</span>
                  </div>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="text-purple-400 hover:text-purple-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5">
                  {aiLoading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                        </div>
                        <div className="absolute -inset-2 rounded-full border-2 border-purple-200 animate-ping opacity-30" />
                      </div>
                      <p className="text-sm text-purple-600 font-medium">Gemini está analizando los datos...</p>
                      <p className="text-xs text-purple-400">Generando recomendaciones accionables</p>
                    </div>
                  )}

                  {aiError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 font-bold mb-1">Error</p>
                      <p className="text-xs text-red-500">{aiError}</p>
                    </div>
                  )}

                  {aiInsights && !aiLoading && (
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                         style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {aiInsights.split('\n').map((line, i) => {
                        if (line.startsWith('## ') || (line.startsWith('**') && line.endsWith('**'))) {
                          const clean = line.replace(/^##\s*/, '').replace(/\*\*/g, '');
                          return <h4 key={i} className="font-black text-gray-900 text-sm mt-4 mb-2">{clean}</h4>;
                        }
                        if (line.startsWith('# ')) {
                          const clean = line.replace(/^#\s*/, '');
                          return <h3 key={i} className="font-black text-gray-900 text-base mt-3 mb-2">{clean}</h3>;
                        }
                        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                          return (
                            <div key={i} className="flex items-start gap-2 py-0.5">
                              <span className="text-purple-400 mt-1 shrink-0">•</span>
                              <span className="text-sm">{line.replace(/^\s*[-•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                            </div>
                          );
                        }
                        if (line.trim().match(/^\d+\.\s/)) {
                          return (
                            <div key={i} className="flex items-start gap-2 py-0.5 ml-1">
                              <span className="text-purple-500 font-bold shrink-0 text-xs mt-0.5">{line.trim().match(/^(\d+\.)/)?.[1]}</span>
                              <span className="text-sm">{line.replace(/^\s*\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                            </div>
                          );
                        }
                        if (!line.trim()) return <div key={i} className="h-2" />;
                        return <p key={i} className="text-sm my-1">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Debug panel */}
          <div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
            >
              <Info className="w-3 h-3" />
              {showDebug ? 'Hide' : 'Show'} API debug info
            </button>
            {showDebug && result.debug && (
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono overflow-auto max-h-52">
                <p className="text-gray-500 mb-1 font-sans font-bold">Fields:</p>
                <p className="text-gray-600 mb-2">{result.debug.fields?.join(', ')}</p>
                <p className="text-gray-500 mb-1 font-sans font-bold">Parsed values:</p>
                <pre className="text-gray-700">{JSON.stringify(result.debug.rawValues, null, 2)}</pre>
                <p className="text-gray-500 mt-2 mb-1 font-sans font-bold">Raw TSV preview:</p>
                <pre className="text-gray-600 whitespace-pre-wrap break-all">{result.debug.rawPreview}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
