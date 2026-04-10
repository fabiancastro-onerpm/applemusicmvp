"use client";

import { Home, MapPin, Users, Activity, Settings, HelpCircle, Music } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Overview", icon: <Home className="w-5 h-5 shrink-0" /> },
    { href: "/geo", label: "Geo Tracking", icon: <MapPin className="w-5 h-5 shrink-0" /> },
    { href: "/overlap", label: "Audience Match", icon: <Users className="w-5 h-5 shrink-0" /> },
    { href: "/tracker", label: "Release Tracker", icon: <Activity className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 text-white min-h-screen p-6 flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-12">
        <Music className="w-8 h-8 text-onerpm-orange" />
        <h1 className="text-xl font-black tracking-tight leading-none">
          ONErpm<br/><span className="text-sm font-medium text-gray-400">Apple Command</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
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

      <div className="mt-auto space-y-2 pt-8 border-t border-gray-800">
        <Link href="/settings" className={`sidebar-item ${pathname === '/settings' ? 'active' : ''}`}>
          <Settings className="w-5 h-5 shrink-0" />
          <span>Settings</span>
        </Link>
        <Link href="/help" className={`sidebar-item ${pathname === '/help' ? 'active' : ''}`}>
          <HelpCircle className="w-5 h-5 shrink-0" />
          <span>Help</span>
        </Link>
      </div>
    </aside>
  );
}
