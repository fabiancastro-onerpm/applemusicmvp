"use client";

import AudienceOverlap from "@/components/AudienceOverlap";
import { MOCK_OVERLAP_DATA } from "@/lib/mock-data";

export default function OverlapPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Audience Match</h1>
        <p className="text-gray-500 mt-1">Shared listeners with other ONErpm artists</p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium">
          ⚠️ Audience Overlap data requires cross-referencing multiple artist IDs via the Apple <code>audience-overlap</code> endpoint. This feature is planned for v1.1.
        </div>
      </div>
      <AudienceOverlap data={MOCK_OVERLAP_DATA} />
    </div>
  );
}
