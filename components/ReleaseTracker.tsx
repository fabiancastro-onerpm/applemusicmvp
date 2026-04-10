"use client";

import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ReleaseTracker({ data }: { data: any }) {
  return (
    <div className="card mt-6 animate-in slide-in-from-bottom-7 duration-1000">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-onerpm-orange" />
            Release Trajectory (First 14 Days)
          </h3>
          <p className="text-sm text-gray-500">Comparative growth of recent releases</p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#6b7280' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingTop: '20px' }} />
            <Line type="monotone" dataKey="releaseA" name="Latest Release" stroke="#FF5722" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="releaseB" name="Previous Release" stroke="#9ca3af" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="releaseC" name="Catalog Average" stroke="#d1d5db" strokeWidth={2} dot={false} activeDot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
