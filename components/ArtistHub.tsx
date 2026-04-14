"use client";

import { Play, Users, Radio, Music } from "lucide-react";

export default function ArtistHub({ data, hasData = true }: { data: any; hasData?: boolean }) {
  const display = (val: any) => (hasData ? val : "—");
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="kpi-card relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-onerpm-orange/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-onerpm-orange/10 rounded-lg">
            <Play className="w-5 h-5 text-onerpm-orange" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Total Streams</h3>
        </div>
        <p className="text-3xl font-black text-gray-900 tracking-tight">{display(data.totalStreams)}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-full">{data.streamsTrend}</span>
          <span className="text-gray-400 text-xs font-medium">vs last period</span>
        </div>
      </div>

      <div className="kpi-card relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Active Listeners</h3>
        </div>
        <p className="text-3xl font-black text-gray-900 tracking-tight">{display(data.activeListeners)}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-full">{data.listenersTrend}</span>
          <span className="text-gray-400 text-xs font-medium">vs last period</span>
        </div>
      </div>

      <div className="kpi-card relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Music className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Shazams</h3>
        </div>
        <p className="text-3xl font-black text-gray-900 tracking-tight">{display(data.shazams)}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-full">{data.shazamsTrend}</span>
          <span className="text-gray-400 text-xs font-medium">vs last period</span>
        </div>
      </div>

      <div className="kpi-card relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Radio className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Radio Spins</h3>
        </div>
        <p className="text-3xl font-black text-gray-900 tracking-tight">{display(data.radioSpins)}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-red-500 font-bold text-sm bg-red-50 px-2 py-0.5 rounded-full">{data.radioTrend}</span>
          <span className="text-gray-400 text-xs font-medium">vs last period</span>
        </div>
      </div>
    </div>
  );
}
