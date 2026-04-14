"use client";

import { useState, useCallback, useRef } from "react";
import {
  Play, Users, Zap, AlertTriangle, Search, Loader2,
  Calendar, X, ChevronDown, CheckCircle2, SkipForward,
  Music, Disc3, BarChart3, Globe2, Brain, Shuffle,
  Activity, Sparkles, RefreshCw
} from "lucide-react";
import ArtistHub from "@/components/ArtistHub";
import GeoMap from "@/components/GeoMap";
import DemoBreakdown from "@/components/DemoBreakdown";
import AudienceOverlap from "@/components/AudienceOverlap";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import TopSongs from "@/components/TopSongs";
import TopAlbums from "@/components/TopAlbums";
import {
  StreamSourcesCard, DeviceOSCard, AudioFormatCard,
  CompletionCard, ContainerTypeCard, SubscriptionCard
} from "@/components/BehaviorMetrics";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface DashboardData {
  kpis: { totalStreams: string; totalListeners: string; completionRate: string | null; skipRate: string | null; rawStreams: number; rawListeners: number };
  timeSeries: any[];
  geo: any[];
  cities: any[];
  age: any[];
  gender: any[];
  songs: any[];
  albums: any[];
  streamSources: any[];
  deviceOS: any[];
  audioFormat: any[];
  endReasons: any[];
  containerTypes: any[];
  subscriptions: any[];
}

const EMPTY_DATA: DashboardData = {
  kpis: { totalStreams: '—', totalListeners: '—', completionRate: null, skipRate: null, rawStreams: 0, rawListeners: 0 },
  timeSeries: [], geo: [], cities: [], age: [], gender: [],
  songs: [], albums: [], streamSources: [], deviceOS: [],
  audioFormat: [], endReasons: [], containerTypes: [], subscriptions: [],
};

// ─── DATE PRESETS ─────────────────────────────────────────────────────────────
const DATE_PRESETS = [
  { label: '7D', days: 7 }, { label: '28D', days: 28 },
  { label: '3M', days: 90 }, { label: '6M', days: 180 }, { label: '1Y', days: 365 },
];

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date(Date.now() - days * 86400000);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

// ─── ARTIST SEARCH BAR ────────────────────────────────────────────────────────
function ArtistSearchBar({ onSelect, onClear, selected }: {
  onSelect: (id: string, name: string, artwork: string) => void;
  onClear: () => void;
  selected: { id: string; name: string; artwork: string } | null;
}) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  if (selected) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-onerpm-orange rounded-2xl shadow-sm min-w-[260px]">
        {selected.artwork && (
          <img src={selected.artwork} alt="" className="w-9 h-9 rounded-xl object-cover shadow" />
        )}
        <div className="min-w-0 flex-grow">
          <p className="text-xs text-gray-400 font-medium">Artist</p>
          <p className="font-black text-gray-900 text-sm truncate">{selected.name}</p>
        </div>
        <button onClick={() => { onClear(); setTerm(''); }} className="text-gray-300 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-w-[280px]">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-onerpm-orange focus-within:ring-2 focus-within:ring-onerpm-orange/20 transition-all">
        {loading ? <Loader2 className="w-4 h-4 text-onerpm-orange animate-spin shrink-0" /> 
                 : <Search className="w-4 h-4 text-gray-400 shrink-0" />}
        <input
          value={term}
          onChange={e => handleChange(e.target.value)}
          placeholder="Search artist by name..."
          className="flex-grow text-sm font-medium outline-none bg-transparent"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {results.map((r: any, i) => (
            <button
              key={r.artistId || i}
              onClick={() => {
                const art = (r.artworkUrl100 || '').replace('100x100', '200x200');
                onSelect(String(r.artistId), r.artistName, art);
                setResults([]);
                setTerm(r.artistName);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
            >
              {r.artworkUrl60
                ? <img src={r.artworkUrl60} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
                : <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"><Music className="w-4 h-4 text-gray-300" /></div>
              }
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{r.artistName}</p>
                <p className="text-xs text-gray-400">{r.primaryGenreName || 'Artist'}</p>
              </div>
              <span className="ml-auto text-xs text-gray-300 font-mono shrink-0">{r.artistId}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB CONFIG ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Overview',        icon: BarChart3 },
  { id: 'catalog',      label: 'Songs & Albums',   icon: Music },
  { id: 'demographics', label: 'Demographics',     icon: Users },
  { id: 'geography',    label: 'Geography',        icon: Globe2 },
  { id: 'behavior',     label: 'Listening Behavior', icon: Activity },
  { id: 'affinity',     label: 'Audience Affinity', icon: Shuffle },
];

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: any; color: string; sub?: string;
}) {
  return (
    <div className="kpi-card relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color}/10 group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${color}/10 rounded-lg`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-gray-500 font-medium text-sm">{label}</h3>
      </div>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 font-medium mt-1">{sub}</p>}
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function Home() {
  const [selectedArtist, setSelectedArtist] = useState<{ id: string; name: string; artwork: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(28);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [hasData, setHasData] = useState(false);
  const [noDataReason, setNoDataReason] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const { startDate, endDate } = getDateRange(selectedPreset);

  const fetchData = async (artistId?: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setNoDataReason(null);
    try {
      const body: any = { startDate, endDate };
      if (artistId) body.artistId = artistId;

      const res = await fetch('/api/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setNoDataReason(json.error || 'API error');
        return;
      }

      if (json.success) {
        setData({
          kpis: json.kpis,
          timeSeries: json.timeSeries || [],
          geo: json.geo || [],
          cities: json.cities || [],
          age: json.age || [],
          gender: json.gender || [],
          songs: json.songs || [],
          albums: json.albums || [],
          streamSources: json.streamSources || [],
          deviceOS: json.deviceOS || [],
          audioFormat: json.audioFormat || [],
          endReasons: json.endReasons || [],
          containerTypes: json.containerTypes || [],
          subscriptions: json.subscriptions || [],
        });
        setHasData(json.hasData);
        if (json.artistName && selectedArtist) {
          setSelectedArtist(prev => prev ? { ...prev, name: json.artistName } : prev);
        }
        if (!json.hasData && json.noDataReason) setNoDataReason(json.noDataReason);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      setNoDataReason('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    fetchData(selectedArtist?.id, startDate, endDate);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-24">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Apple Music Intelligence
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Real-time analytics from the Apple Music Analytics API
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
              Live Apple Data
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
            )}
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Artist search */}
          <ArtistSearchBar
            selected={selectedArtist}
            onSelect={(id, name, artwork) => setSelectedArtist({ id, name, artwork })}
            onClear={() => { setSelectedArtist(null); setData(EMPTY_DATA); setHasData(false); }}
          />

          {/* Date presets */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1">
            {DATE_PRESETS.map(p => (
              <button
                key={p.days}
                onClick={() => setSelectedPreset(p.days)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  selectedPreset === p.days
                    ? 'bg-onerpm-orange text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date display */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{startDate} → {endDate}</span>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl font-bold disabled:opacity-50"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading 14 metrics...</>
              : <><Zap className="w-4 h-4" /> Generate Report</>
            }
          </button>

          {hasData && (
            <button
              onClick={handleGenerate}
              className="p-3 text-gray-400 hover:text-gray-700 hover:bg-white border border-gray-200 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Artist header ──────────────────────────────────────────────────── */}
      {selectedArtist?.name && (
        <div className="flex items-center gap-4 animate-in slide-in-from-top-2 duration-300">
          {selectedArtist.artwork && (
            <img src={selectedArtist.artwork} alt={selectedArtist.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
          )}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Now viewing</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{selectedArtist.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">ID: {selectedArtist.id}</p>
          </div>
        </div>
      )}

      {/* ── No Data Warning ─────────────────────────────────────────────────── */}
      {noDataReason && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-4 animate-in fade-in duration-300">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="font-bold text-sm">No data found</p>
            <p className="text-sm mt-0.5 text-amber-700">{noDataReason}</p>
          </div>
        </div>
      )}

      {/* ── KPI Row (always visible once loaded) ───────────────────────────── */}
      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2 duration-400">
          <KpiCard label="Total Streams"    value={data.kpis.totalStreams}   icon={Play}         color="bg-onerpm-orange" />
          <KpiCard label="Active Listeners" value={data.kpis.totalListeners} icon={Users}        color="bg-blue-500" />
          <KpiCard
            label="Completion Rate"
            value={data.kpis.completionRate ?? '—'}
            icon={CheckCircle2}
            color="bg-emerald-500"
            sub="songs played to end"
          />
          <KpiCard
            label="Skip Rate"
            value={data.kpis.skipRate ?? '—'}
            icon={SkipForward}
            color="bg-red-400"
            sub="songs not completed"
          />
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      {hasData && (
        <div className="border-b border-gray-200 -mb-2">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'text-onerpm-orange border-onerpm-orange'
                      : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!hasData && !loading && !noDataReason && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-onerpm-orange" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to analyze</h2>
          <p className="text-gray-500 max-w-md">
            Search for an artist, select a date range, and click <strong>Generate Report</strong> to unlock
            14 dimensions of real Apple Music data.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 text-left max-w-lg">
            {['Streams & Listeners', 'Global Distribution', 'Age & Gender', 'Top Songs & Albums', 'Audio Format Quality', 'Audience Affinity'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-100 rounded-xl px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB CONTENT
      ───────────────────────────────────────────────────────────────────── */}
      {hasData && activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TimeSeriesChart data={data.timeSeries} />
          <GeoMap data={data.geo} cities={data.cities} />
        </div>
      )}

      {hasData && activeTab === 'catalog' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <TopSongs data={data.songs} totalStreams={data.kpis.rawStreams} />
          <TopAlbums data={data.albums} />
        </div>
      )}

      {hasData && activeTab === 'demographics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <DemoBreakdown data={{ age: data.age, gender: data.gender }} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubscriptionCard data={data.subscriptions} />
            <ContainerTypeCard data={data.containerTypes} />
          </div>
        </div>
      )}

      {hasData && activeTab === 'geography' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GeoMap data={data.geo} cities={data.cities} />
        </div>
      )}

      {hasData && activeTab === 'behavior' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreamSourcesCard data={data.streamSources} />
            <DeviceOSCard data={data.deviceOS} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AudioFormatCard data={data.audioFormat} />
            <CompletionCard data={data.endReasons} />
          </div>
        </div>
      )}

      {hasData && activeTab === 'affinity' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <AudienceOverlap
            primaryArtistId={selectedArtist?.id || ''}
            primaryArtistName={selectedArtist?.name || ''}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}
    </div>
  );
}
