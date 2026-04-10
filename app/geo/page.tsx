"use client";

import { useState } from "react";
import GeoMap from "@/components/GeoMap";
import { MOCK_GEO_DATA, MOCK_GEO_CITIES } from "@/lib/mock-data";

export default function GeoPage() {
  const [artistId, setArtistId] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoData, setGeoData] = useState({ geo: MOCK_GEO_DATA, cities: MOCK_GEO_CITIES });

  const fetchGeo = async () => {
    if (!artistId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/apple?artistId=${artistId}&timeFilter=allTime`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGeoData({ geo: json.data.geo, cities: json.data.cities });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Geo Tracking</h1>
          <p className="text-gray-500 mt-1">Audience Geographic Distribution</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Apple Artist ID (Adam ID)"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className="border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm outline-none focus:border-onerpm-orange focus:ring-1 focus:ring-onerpm-orange w-56"
          />
          <button onClick={fetchGeo} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Loading..." : "Load Geo Data"}
          </button>
        </div>
      </div>
      <GeoMap data={geoData.geo} cities={geoData.cities} />
    </div>
  );
}
