"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface TimePoint { date: string; streams: number; listeners: number; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-4 min-w-[180px]">
      <p className="text-xs font-bold text-gray-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-6 text-sm">
          <span className="font-medium" style={{ color: p.color }}>{p.name}</span>
          <span className="font-black text-gray-900">{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function TimeSeriesChart({ data }: { data: TimePoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-onerpm-orange" />
          <h3 className="text-xl font-bold text-gray-900">Stream History</h3>
        </div>
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          No time series data available for this period
        </div>
      </div>
    );
  }

  const maxStreams = Math.max(...data.map(d => d.streams));
  const avgStreams = data.reduce((s, d) => s + d.streams, 0) / data.length;

  // Format label: show every Nth date to avoid clutter
  const step = Math.ceil(data.length / 8);
  const tickFormatter = (val: string, idx: number) =>
    idx % step === 0 ? val.slice(5) : ''; // MM-DD format

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-onerpm-orange" />
            Stream History
          </h3>
          <p className="text-sm text-gray-500 mt-1">Daily streams & unique listeners over selected period</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          <Calendar className="w-3.5 h-3.5" />
          {data.length} days
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">Peak Day</p>
          <p className="text-lg font-black text-onerpm-orange">{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(maxStreams)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">Daily Avg</p>
          <p className="text-lg font-black text-gray-900">{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Math.round(avgStreams))}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">Total</p>
          <p className="text-lg font-black text-blue-600">{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(data.reduce((s, d) => s + d.streams, 0))}</p>
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
              tickFormatter={(v, i) => tickFormatter(v, i)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={v => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={avgStreams} stroke="#e5e7eb" strokeDasharray="4 4" />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '12px' }} />
            <Line
              type="monotone" dataKey="streams" name="Streams"
              stroke="#f04f23" strokeWidth={3}
              dot={data.length < 20 ? { r: 3, strokeWidth: 0, fill: '#f04f23' } : false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone" dataKey="listeners" name="Listeners"
              stroke="#6366f1" strokeWidth={2} strokeDasharray="0"
              dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
