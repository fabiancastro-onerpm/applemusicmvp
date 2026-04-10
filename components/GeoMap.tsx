"use client";

import { Map } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GeoMap({ data, cities }: { data: any, cities: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-700">
      <div className="card lg:col-span-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Map className="w-6 h-6 text-onerpm-orange" />
              Global Distribution
            </h3>
            <p className="text-sm text-gray-500">Top countries by stream volume</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [new Intl.NumberFormat('en-US').format(value), 'Streams']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#FF5722' : '#e5e7eb'} className="transition-colors duration-300 hover:fill-onerpm-orange-light" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Cities</h3>
        <div className="space-y-5">
          {cities.map((city: any, i: number) => (
            <div key={i} className="group">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-onerpm-orange transition-colors">{city.city}</p>
                  <p className="text-xs font-medium text-gray-500">{city.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(city.streams)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-onerpm-orange transition-all duration-1000" 
                  style={{ width: `${(city.streams / cities[0].streams) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
