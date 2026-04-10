"use client";

import { useState } from "react";
import ArtistHub from "@/components/ArtistHub";
import GeoMap from "@/components/GeoMap";
import DemoBreakdown from "@/components/DemoBreakdown";
import AudienceOverlap from "@/components/AudienceOverlap";
import ReleaseTracker from "@/components/ReleaseTracker";
import { 
  MOCK_KPI_DATA, 
  MOCK_GEO_DATA, 
  MOCK_GEO_CITIES, 
  MOCK_DEMO_DATA,
  MOCK_OVERLAP_DATA,
  MOCK_RELEASE_DATA
} from "@/lib/mock-data";

export default function Home() {
  const [artistId, setArtistId] = useState("");
  const [timeFilter, setTimeFilter] = useState("28days");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    kpis: MOCK_KPI_DATA,
    geo: MOCK_GEO_DATA,
    cities: MOCK_GEO_CITIES,
    demo: MOCK_DEMO_DATA,
    overlap: MOCK_OVERLAP_DATA,
    releases: MOCK_RELEASE_DATA
  });

  const generateReport = async () => {
    if (!artistId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/apple?artistId=${artistId}&timeFilter=${timeFilter}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setDashboardData(json.data);
          console.log("Success! Pure Apple API Response:", json.raw);
        }
      } else {
        const errJson = await response.json();
        alert(`Apple API Error: ${errJson.error || response.statusText}\n\n${errJson.details}`);
        console.error("Apple API Error Details:", errJson);
      }
    } catch (err) {
      console.error(err);
      alert("Network or Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Artist Overview</h1>
          <p className="text-gray-500 mt-1">Apple Music Performance Metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="text" 
            placeholder="Apple Artist ID (Adam ID)" 
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm outline-none focus:border-onerpm-orange focus:ring-1 focus:ring-onerpm-orange w-56"
          />
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm outline-none focus:border-onerpm-orange focus:ring-1 focus:ring-onerpm-orange"
          >
            <option value="7days">Last 7 Days</option>
            <option value="28days">Last 28 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="allTime">Last 365 Days (All Time)</option>
          </select>
          <button onClick={generateReport} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Connecting to Apple..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <ArtistHub data={dashboardData.kpis} />

      {/* Secondary Row: Geo and Overlap */}
      <GeoMap data={dashboardData.geo} cities={dashboardData.cities} />

      {/* Third Row: Demographics and Release Analytics */}
      <DemoBreakdown data={dashboardData.demo} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AudienceOverlap data={dashboardData.overlap} />
        <ReleaseTracker data={dashboardData.releases} />
      </div>
    </div>
  );
}
