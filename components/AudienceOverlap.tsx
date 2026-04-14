"use client";

import { useState } from 'react';
import { Users, Zap, Search, Loader2 } from 'lucide-react';

interface OverlapSummary {
  primaryListeners: string;
  secondaryListeners: string;
  sharedListeners: string;
  overlapPct: number;
  rawPrimary: number;
  rawSecondary: number;
  rawOverlap: number;
}

interface AudienceOverlapProps {
  primaryArtistId: string;
  primaryArtistName: string;
  startDate: string;
  endDate: string;
}

function ArtistSearch({
  placeholder, onSelect
}: { placeholder: string; onSelect: (id: string, name: string) => void }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/itunes-search?term=${encodeURIComponent(term)}&entity=musicArtist&limit=5`);
      const json = await res.json();
      setResults(json.results || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          value={term}
          onChange={e => setTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder={placeholder}
          className="flex-grow border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-onerpm-orange focus:ring-1 focus:ring-onerpm-orange"
        />
        <button
          onClick={search}
          className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.map((r: any) => (
            <button
              key={r.artistId}
              onClick={() => { onSelect(String(r.artistId), r.artistName); setResults([]); setTerm(r.artistName); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
            >
              {r.artworkUrl60 && <img src={r.artworkUrl60} alt="" className="w-8 h-8 rounded-lg object-cover" />}
              <div>
                <p className="text-sm font-bold text-gray-900">{r.artistName}</p>
                <p className="text-xs text-gray-400">{r.primaryGenreName || 'Artist'}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Venn diagram visual
function VennDiagram({ pct, primaryName, secondaryName, summary }: {
  pct: number; primaryName: string; secondaryName: string; summary: OverlapSummary;
}) {
  const overlap = Math.min(pct, 60);
  const translatePx = Math.round((overlap / 60) * 40);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* SVG Venn */}
      <div className="relative w-64 h-40">
        <svg viewBox="0 0 240 160" className="w-full h-full">
          {/* Primary circle */}
          <circle cx="90" cy="80" r="65" fill="#f04f23" fillOpacity="0.25" stroke="#f04f23" strokeWidth="2" />
          {/* Secondary circle */}
          <circle cx="150" cy="80" r="65" fill="#6366f1" fillOpacity="0.25" stroke="#6366f1" strokeWidth="2" />
          {/* Overlap region */}
          <text x="90" y="84" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f04f23">{primaryName.slice(0, 8)}</text>
          <text x="150" y="84" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6366f1">{secondaryName.slice(0, 8)}</text>
          <text x="120" y="75" textAnchor="middle" fontSize="13" fontWeight="900" fill="#374151">{pct}%</text>
          <text x="120" y="90" textAnchor="middle" fontSize="8" fill="#6b7280">shared</text>
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 w-full">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1 font-medium">{primaryName.slice(0, 12)} listeners</p>
          <p className="text-xl font-black text-gray-900">{summary.primaryListeners}</p>
        </div>
        <div className="text-center border-x border-gray-100">
          <p className="text-xs text-onerpm-orange font-bold mb-1">SHARED</p>
          <p className="text-xl font-black text-onerpm-orange">{summary.sharedListeners}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1 font-medium">{secondaryName.slice(0, 12)} listeners</p>
          <p className="text-xl font-black text-gray-900">{summary.secondaryListeners}</p>
        </div>
      </div>
    </div>
  );
}

export default function AudienceOverlapCard({
  primaryArtistId, primaryArtistName, startDate, endDate
}: AudienceOverlapProps) {
  const [secondaryId, setSecondaryId] = useState('');
  const [secondaryName, setSecondaryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: OverlapSummary } | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      if (json.success) {
        setResult(json);
      } else {
        setError(json.error || 'No overlap data found');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-onerpm-orange" />
            Audience Affinity (Overlap)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Real shared listener data between <span className="font-bold text-gray-700">{primaryArtistName || 'this artist'}</span> and another artist
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Zap className="w-3 h-3" /> Live Data
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Compare against</p>
        <ArtistSearch
          placeholder="Search for a second artist..."
          onSelect={(id, name) => { setSecondaryId(id); setSecondaryName(name); }}
        />
      </div>

      <button
        onClick={runOverlap}
        disabled={!secondaryId || !primaryArtistId || loading}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Analyzing Overlap...' : 'Calculate Audience Overlap'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {result && result.summary && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <VennDiagram
            pct={result.summary.overlapPct}
            primaryName={primaryArtistName}
            secondaryName={secondaryName}
            summary={result.summary}
          />
          <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-gray-900">{result.summary.overlapPct}%</span> of{' '}
              <span className="font-bold">{primaryArtistName}</span>&apos;s listeners also listened to{' '}
              <span className="font-bold">{secondaryName}</span> — indicating{' '}
              {result.summary.overlapPct > 40
                ? '🔥 strong audience affinity. Cross-promotion highly recommended.'
                : result.summary.overlapPct > 20
                ? '👍 moderate affinity. Potential for collaborative campaigns.'
                : '💡 low overlap — distinct fanbases with growth potential through cross-exposure.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
