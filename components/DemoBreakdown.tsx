"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Users, PieChart, Target, Zap } from 'lucide-react';

const COLORS = ['#FF5722', '#F44336', '#E91E63', '#9C27B0', '#673AB7'];
const GENDER_COLORS: Record<string, string> = {
  'Female': '#FF5722',
  'Male': '#9ca3af',
  'Non-binary': '#e5e7eb'
};

export default function DemoBreakdown({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-600">
      {/* Age Distribution */}
      <div className="card">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-onerpm-orange" />
              Age Segmentation
            </h3>
            <p className="text-sm text-gray-500 mt-1">Direct breakdown of listener age ranges</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.age} layout="vertical" margin={{ left: -10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical stroke="#f1f1f1" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="range" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 13, fontWeight: 600, fill: '#374151' }} 
              />
              <Tooltip 
                 cursor={{ fill: 'transparent' }}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {data.age.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 25 ? '#FF5722' : '#9ca3af'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
           <div className="flex gap-3">
              <Zap className="w-5 h-5 text-onerpm-orange shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                 <span className="font-bold text-gray-900">Core Audience:</span> Your primary listeners are aged <span className="font-extrabold text-onerpm-orange">18-24</span>. This segment is highly active on social media and drives most of your Shazam interaction.
              </p>
           </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="card">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-onerpm-orange" />
              Gender Identity
            </h3>
            <p className="text-sm text-gray-500 mt-1">Self-identified listener demographic</p>
          </div>
        </div>

        <div className="space-y-8 mt-12">
          {data.gender.map((item: any, i: number) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-end">
                 <div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{item.type}</span>
                    <p className="text-2xl font-black text-gray-900">{item.value}%</p>
                 </div>
                 <div className="text-xs font-bold text-gray-400">
                    {item.value > 50 ? 'Dominant Segment' : ''}
                 </div>
              </div>
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ 
                    width: `${item.value}%`, 
                    backgroundColor: GENDER_COLORS[item.type] || '#e5e7eb' 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-gray-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                 <Target className="w-6 h-6 text-onerpm-orange" />
              </div>
              <div>
                 <p className="font-bold text-gray-900">Ad Strategy Recommendation</p>
                 <p className="text-xs text-gray-500 font-medium tracking-tight">Focus budget on urban female-leaning playlists.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
