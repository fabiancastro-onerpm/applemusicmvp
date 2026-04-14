"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Smartphone, Monitor, Tv, Speaker, LayoutGrid,
  Search, BookOpen, Sparkles, Radio, SkipForward,
  CheckCircle, Volume2, Headphones
} from 'lucide-react';

// ─── DONUT CHART  ─────────────────────────────────────────────────────────────
const PALETTES = {
  orange:  ['#f04f23', '#ff7849', '#ffaa8a', '#ffd4c0', '#ffe8de'],
  blue:    ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'],
  green:   ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  slate:   ['#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
};

function DonutChart({ data, palette = 'orange', label }: {
  data: { name: string; value: number; pct: number }[];
  palette?: keyof typeof PALETTES;
  label?: string;
}) {
  if (!data || data.length === 0) return (
    <div className="h-[160px] flex items-center justify-center text-gray-300 text-sm">No data</div>
  );
  const colors = PALETTES[palette];
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
            dataKey="value" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip
            formatter={(v: number) => [new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v), 'Streams']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── HORIZONTAL BAR ROWS ──────────────────────────────────────────────────────
function BarRows({ items, color = '#f04f23', maxVal }: {
  items: { label: string; pct: number; value: number }[];
  color?: string;
  maxVal?: number;
}) {
  const max = maxVal || Math.max(...items.map(i => i.pct), 1);
  return (
    <div className="space-y-3 mt-2">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">{item.label}</span>
            <span className="font-black text-gray-900">{item.pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.pct / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── STREAM SOURCES ────────────────────────────────────────────────────────────
export function StreamSourcesCard({ data }: { data: { source: string; streams: number; pct: number }[] }) {
  const IconMap: Record<string, any> = {
    Library: BookOpen, Search, Discovery: Sparkles, MusicKit: LayoutGrid, Other: Radio
  };
  const donut = data.map(d => ({ name: d.source, value: d.streams, pct: d.pct }));
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Source of Stream</h3>
      <p className="text-xs text-gray-400 mb-5">How listeners discover and play music</p>
      <DonutChart data={donut} palette="orange" />
      <div className="space-y-3 mt-4">
        {data.map((d, i) => {
          const Icon = IconMap[d.source] || Radio;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="p-1.5 bg-orange-50 rounded-lg shrink-0">
                <Icon className="w-3.5 h-3.5 text-onerpm-orange" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{d.source}</span>
                  <span className="font-black text-gray-900">{d.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-onerpm-orange rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DEVICE OS ────────────────────────────────────────────────────────────────
export function DeviceOSCard({ data }: { data: { os: string; streams: number; pct: number }[] }) {
  const IconMap: Record<string, any> = {
    iOS: Smartphone, Mac: Monitor, Android: Smartphone,
    Windows: Monitor, 'Apple TV': Tv, Sonos: Speaker, Other: Headphones
  };
  const donut = data.map(d => ({ name: d.os, value: d.streams, pct: d.pct }));
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Device OS</h3>
      <p className="text-xs text-gray-400 mb-5">Platforms listeners use to stream</p>
      <DonutChart data={donut} palette="blue" />
      <div className="space-y-3 mt-4">
        {data.map((d, i) => {
          const Icon = IconMap[d.os] || Monitor;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 rounded-lg shrink-0">
                <Icon className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{d.os}</span>
                  <span className="font-black text-gray-900">{d.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AUDIO FORMAT ─────────────────────────────────────────────────────────────
export function AudioFormatCard({ data }: { data: { format: string; streams: number; pct: number }[] }) {
  const colors: Record<string, string> = {
    'Spatial Audio':  '#a855f7',
    'Lossless (ALAC)': '#22c55e',
    'Standard (AAC)': '#94a3b8',
    'Other':          '#e2e8f0',
  };
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Audio Format</h3>
      <p className="text-xs text-gray-400 mb-5">How fans prefer to consume audio quality</p>
      <div className="space-y-4 mt-2">
        {data.map((d, i) => {
          const color = colors[d.format] || '#94a3b8';
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-semibold text-gray-700">{d.format}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{d.pct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${d.pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 p-3 bg-purple-50 rounded-xl border border-purple-100">
        <p className="text-xs text-purple-700 font-medium">
          💡 Spatial Audio = engaged, premium listeners — ideal for editorial playlist targeting
        </p>
      </div>
    </div>
  );
}

// ─── COMPLETION RATE ──────────────────────────────────────────────────────────
export function CompletionCard({ data }: { data: { reason: string; streams: number; pct: number }[] }) {
  const colorMap: Record<string, string> = {
    Completed: '#22c55e', Skipped: '#f04f23',
    'Manually Stopped': '#f59e0b', Paused: '#6366f1', Other: '#94a3b8'
  };
  const completed = data.find(d => d.reason === 'Completed');
  const skipped = data.find(d => d.reason === 'Skipped');

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Listen Completion</h3>
      <p className="text-xs text-gray-400 mb-5">How listeners engage with songs to the end</p>

      {/* Big KPI */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
          <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-black text-green-600">{completed?.pct ?? 0}%</p>
          <p className="text-xs text-green-600 font-semibold mt-1">Completed</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
          <SkipForward className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <p className="text-3xl font-black text-red-500">{skipped?.pct ?? 0}%</p>
          <p className="text-xs text-red-500 font-semibold mt-1">Skipped</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorMap[d.reason] || '#94a3b8' }} />
            <div className="flex-grow">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700">{d.reason}</span>
                <span className="font-black text-gray-900">{d.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: colorMap[d.reason] || '#94a3b8' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CONTAINER TYPE (Playlist vs Album vs Radio) ───────────────────────────────
export function ContainerTypeCard({ data }: { data: { type: string; streams: number; pct: number }[] }) {
  const colorMap: Record<string, string> = {
    'Playlist': '#f04f23', 'Album': '#6366f1', 'Single Track': '#22c55e', 'Radio Station': '#f59e0b'
  };
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Where It's Played</h3>
      <p className="text-xs text-gray-400 mb-5">Container type driving the most streams</p>
      <div className="space-y-4">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-800">{d.type}</span>
              <span className="font-black" style={{ color: colorMap[d.type] || '#94a3b8' }}>{d.pct}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${d.pct}%`, backgroundColor: colorMap[d.type] || '#94a3b8' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SUBSCRIPTION TYPES ────────────────────────────────────────────────────────
export function SubscriptionCard({ data }: { data: { type: string; streams: number; pct: number }[] }) {
  const top = data.slice(0, 6);
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Subscription Type</h3>
      <p className="text-xs text-gray-400 mb-5">Which Apple Music plans your fans are on</p>
      <BarRows
        items={top.map(d => ({ label: d.type, pct: d.pct, value: d.streams }))}
        color="#6366f1"
      />
    </div>
  );
}
