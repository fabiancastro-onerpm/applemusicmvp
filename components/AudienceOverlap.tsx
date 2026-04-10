"use client";

import { Users, Shuffle } from "lucide-react";

export default function AudienceOverlap({ data }: { data: any }) {
  return (
    <div className="card mt-6 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-onerpm-orange" />
            Audience Affinity (Overlap)
          </h3>
          <p className="text-sm text-gray-500">Shared listeners with other ONErpm artists</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          <Shuffle className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-8 flex-shrink-0 text-sm font-bold text-gray-400">#{i + 1}</div>
            <div className="w-32 flex-shrink-0 font-medium text-gray-900">{item.artist}</div>
            <div className="flex-grow flex items-center gap-3">
              <div className="flex-grow bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${item.overlap}%`, backgroundColor: item.color }}
                ></div>
              </div>
              <div className="w-12 text-right text-sm font-bold" style={{ color: item.color }}>
                {item.overlap}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
