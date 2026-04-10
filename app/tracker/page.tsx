"use client";

import ReleaseTracker from "@/components/ReleaseTracker";
import { MOCK_RELEASE_DATA } from "@/lib/mock-data";

export default function TrackerPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Release Tracker</h1>
        <p className="text-gray-500 mt-1">Comparative performance of recent releases</p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium">
          ⚠️ Release Trajectory requires individual <code>song_id</code> lookups per release. This feature is planned for v1.1.
        </div>
      </div>
      <ReleaseTracker data={MOCK_RELEASE_DATA} />
    </div>
  );
}
