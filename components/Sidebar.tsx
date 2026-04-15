"use client";

import {
  BarChart3, Globe2, Users, Activity, Music, Shuffle, Home, Settings, HelpCircle, Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleSync = (e: any) => setActiveTab(e.detail);
    window.addEventListener('syncTab', handleSync);
    return () => window.removeEventListener('syncTab', handleSync);
  }, []);

  const handleNav = (id: string) => {
    setActiveTab(id);
    window.dispatchEvent(new CustomEvent('changeTab', { detail: id }));
  };

  const navItems = [
    { href: '/', label: 'Dashboard',        icon: <Home  className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 text-white min-h-screen p-6 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10 py-4 px-2 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5">
        <img
          src="/onerpm-logo.png"
          alt="ONErpm"
          className="h-10 w-auto opacity-90"
        />
        <div className="text-center mt-2">
          <p className="text-sm font-black text-white tracking-tight">Apple Intelligence</p>
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em] mt-0.5">Analytics Hub</p>
        </div>
      </div>

      {/* Analytics sections (visual only — all in one page via tabs) */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-2">Analytics</p>
        <div className="space-y-1">
          {[
            { id: 'overview',     label: 'Overview & Time Series', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'catalog',      label: 'Songs & Albums',         icon: <Music className="w-4 h-4" /> },
            { id: 'demographics', label: 'Demographics',           icon: <Users className="w-4 h-4" /> },
            { id: 'geography',    label: 'Geography',              icon: <Globe2 className="w-4 h-4" /> },
            { id: 'behavior',     label: 'Listening Behavior',     icon: <Activity className="w-4 h-4" /> },
            { id: 'playlist',     label: 'Playlist Journey',       icon: <Shuffle className="w-4 h-4" /> },
            { id: 'affinity',     label: 'Audience Affinity',      icon: <Zap className="w-4 h-4" /> },
          ].map((item, i) => (
            <button 
              key={item.id} 
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${activeTab === item.id ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
            >
              <span className={`${activeTab === item.id ? 'text-onerpm-orange' : 'text-gray-600'}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data coverage */}
      <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
        <p className="text-xs font-bold text-gray-300 mb-3">Live Data Coverage</p>
        <div className="space-y-2">
          {[
            '14 Apple API dimensions', 'iTunes metadata enrichment',
            'Audience overlap analysis', 'Up to 365 days history',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Apple API Connected
        </div>
        <Link href="/" className="sidebar-item">
          <Settings className="w-5 h-5 shrink-0" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
