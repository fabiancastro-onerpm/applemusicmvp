"use client";

import { Home, MapPin, Users, Activity, Settings, HelpCircle, Music } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 text-white min-h-screen p-6 flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-12">
        <Music className="w-8 h-8 text-onerpm-orange" />
        <h1 className="text-xl font-black tracking-tight leading-none">
          ONErpm<br/><span className="text-sm font-medium text-gray-400">Apple Command</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        <Link href="/" className="sidebar-item active">
          <Home className="w-5 h-5 shrink-0" />
          <span>Overview</span>
        </Link>
        <Link href="/geo" className="sidebar-item">
          <MapPin className="w-5 h-5 shrink-0" />
          <span>Geo Tracking</span>
        </Link>
        <Link href="/overlap" className="sidebar-item">
          <Users className="w-5 h-5 shrink-0" />
          <span>Audience Match</span>
        </Link>
        <Link href="/tracker" className="sidebar-item">
          <Activity className="w-5 h-5 shrink-0" />
          <span>Release Tracker</span>
        </Link>
      </nav>

      <div className="mt-auto space-y-2 pt-8 border-t border-gray-800">
        <Link href="/settings" className="sidebar-item">
          <Settings className="w-5 h-5 shrink-0" />
          <span>Settings</span>
        </Link>
        <Link href="/help" className="sidebar-item">
          <HelpCircle className="w-5 h-5 shrink-0" />
          <span>Help</span>
        </Link>
      </div>
    </aside>
  );
}
