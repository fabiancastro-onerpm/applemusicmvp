"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Map, Globe } from 'lucide-react';

interface GeoItem  { country: string; streams: number; listeners: number; pct: number; }
interface CityItem { id?: string; city: string; country: string; streams: number; listeners: number; pct: number; }

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtFull = (n: number) => new Intl.NumberFormat('en-US').format(n);

// Country code → flag emoji
const flag = (code: string) => {
  if (!code || code.length !== 2) return '🌐';
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397));
};

export default function GeoMap({ data, cities }: { data: GeoItem[]; cities: CityItem[] }) {
  const validData  = (data   || []).filter(d => d.country && d.country !== 'XX' && d.streams > 0);
  const validCities = (cities || []).filter(c => c.city && c.city !== 'null' && c.city !== 'Unknown City' && c.streams > 0);

  const top10 = validData.slice(0, 10);
  const maxGeo = top10[0]?.streams || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-700">
      
      {/* ── Global Distribution ─────────────────────────────────────────── */}
      <div className="card lg:col-span-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-6 h-6 text-onerpm-orange" />
              Global Distribution
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {validData.length} countries · streams by storefront
            </p>
          </div>
          {validData[0] && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Top Market</p>
              <p className="text-lg font-black text-gray-900">
                {flag(validData[0].country)} {validData[0].country}
              </p>
            </div>
          )}
        </div>

        {validData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-300 text-sm">No geographic data</div>
        ) : (
          <>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="country"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#6b7280' }}
                    tickFormatter={c => `${flag(c)} ${c}`}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={v => fmt(v)}
                  />
                  <Tooltip
                    cursor={{ fill: '#fef3f2' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,.1)' }}
                    formatter={(v: number, name: string) => [fmtFull(v), name === 'streams' ? 'Streams' : 'Listeners']}
                    labelFormatter={(l) => `${flag(l)} ${l}`}
                  />
                  <Bar dataKey="streams" radius={[6, 6, 0, 0]} barSize={36}>
                    {top10.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#f04f23' : i < 3 ? '#ff7849' : i < 6 ? '#ffa080' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Full country table */}
            {validData.length > 3 && (
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  All {validData.length} markets
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {validData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                      <span className="text-base">{flag(d.country)}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700">{d.country}</p>
                        <p className="text-xs text-gray-400">{fmt(d.streams)}</p>
                      </div>
                      <span className="ml-auto text-xs font-black text-gray-400 shrink-0">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Top Cities ──────────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Map className="w-6 h-6 text-onerpm-orange" />
          Top Cities
        </h3>

        {validCities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No city data available</p>
        ) : (
          <div className="space-y-5">
            {validCities.map((city, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900 group-hover:text-onerpm-orange transition-colors">
                      #{i + 1} {city.city}
                    </p>
                    <p className="text-xs font-medium text-gray-400">{city.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">{fmt(city.streams)}</p>
                    <p className="text-xs text-gray-400">{city.pct}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-onerpm-orange transition-all duration-1000"
                    style={{ width: `${(city.streams / (validCities[0]?.streams || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
