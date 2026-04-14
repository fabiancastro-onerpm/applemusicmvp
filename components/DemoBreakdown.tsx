"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, PieChart as PieIcon, Zap, Target } from 'lucide-react';

interface AgeItem  { range: string; streams: number; listeners: number; pct: number; }
interface GenderItem { type: string; streams: number; listeners: number; pct: number; }

const GENDER_COLORS: Record<string, { bg: string; bar: string; text: string }> = {
  Male:              { bg: 'bg-blue-50',   bar: '#6366f1', text: 'text-indigo-600' },
  Female:            { bg: 'bg-orange-50', bar: '#f04f23', text: 'text-orange-600' },
  'Other/Non-binary':{ bg: 'bg-gray-50',   bar: '#94a3b8', text: 'text-gray-500' },
  'Not Specified':   { bg: 'bg-gray-50',   bar: '#d1d5db', text: 'text-gray-400' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export default function DemoBreakdown({
  data
}: {
  data: { age: AgeItem[]; gender: GenderItem[] };
}) {
  const { age = [], gender = [] } = data;

  // Dominant age
  const peakAge = [...age].sort((a, b) => b.pct - a.pct)[0];
  // Dominant gender
  const peakGender = [...gender].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-600">
      {/* ── Age Segmentation ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-onerpm-orange" />
              Age Segmentation
            </h3>
            <p className="text-sm text-gray-500 mt-1">Apple Music listener age distribution</p>
          </div>
          {peakAge && (
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">Core Segment</p>
              <p className="text-lg font-black text-onerpm-orange">{peakAge.range}</p>
            </div>
          )}
        </div>

        {age.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-gray-300 text-sm">No age data</div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={age} layout="vertical" margin={{ left: 0, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="range" type="category"
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 13, fontWeight: 700, fill: '#374151' }}
                  width={60}
                />
                <Tooltip
                  cursor={{ fill: '#fef3f2' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,.1)', fontSize: '13px' }}
                  formatter={(v: number, name: string) => [
                    name === 'pct' ? `${v}%` : fmt(v),
                    name === 'pct' ? 'Share' : name === 'streams' ? 'Streams' : 'Listeners'
                  ]}
                />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={24} label={{ position: 'right', fontSize: 12, fontWeight: 700, fill: '#6b7280', formatter: (v: number) => `${v}%` }}>
                  {age.map((entry, i) => (
                    <Cell key={i} fill={entry.pct === Math.max(...age.map(a => a.pct)) ? '#f04f23' : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {peakAge && (
          <div className="mt-5 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-onerpm-orange shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">Core Audience:</span>{' '}
                {peakAge.range}-year-olds represent{' '}
                <span className="font-extrabold text-onerpm-orange">{peakAge.pct}%</span> of streams.{' '}
                {Number(peakAge.range.split('-')[0]) <= 24
                  ? 'This Gen-Z segment leads social sharing and Shazam activity.'
                  : Number(peakAge.range.split('-')[0]) <= 34
                  ? 'Core Millennial segment — high playlist engagement and premium subscriptions.'
                  : 'Established audience with high completion rates and loyalty.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Gender Identity ──────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PieIcon className="w-6 h-6 text-onerpm-orange" />
              Gender Identity
            </h3>
            <p className="text-sm text-gray-500 mt-1">Self-identified Apple Music listener breakdown</p>
          </div>
          {peakGender && (
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">Leading Segment</p>
              <p className="text-lg font-black text-onerpm-orange">{peakGender.pct}%</p>
            </div>
          )}
        </div>

        {gender.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-gray-300 text-sm">No gender data</div>
        ) : (
          <div className="space-y-6 mt-4">
            {gender.map((item, i) => {
              const style = GENDER_COLORS[item.type] || { bg: 'bg-gray-50', bar: '#94a3b8', text: 'text-gray-500' };
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.type}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-2xl font-black text-gray-900">{item.pct}%</p>
                        <p className="text-xs text-gray-400 font-medium">{fmt(item.streams)} streams</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 ${style.bg} rounded-full`}>
                      <span className={`text-xs font-bold ${style.text}`}>
                        {item.pct > 50 ? 'Dominant' : item.pct > 30 ? 'Significant' : 'Minority'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.pct}%`, backgroundColor: style.bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-onerpm-orange" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Campaign Targeting</p>
              <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                {peakGender
                  ? `Focus ad budget on ${peakGender.type.toLowerCase()}-leaning editorial playlists and targeted Apple Music campaigns.`
                  : 'Generate data to unlock targeting recommendations.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
