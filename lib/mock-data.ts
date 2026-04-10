export const MOCK_KPI_DATA = {
  totalStreams: "12,450,000",
  streamsTrend: "+5.2%",
  activeListeners: "2,340,000",
  listenersTrend: "+1.1%",
  shazams: "450,000",
  shazamsTrend: "+12.4%",
  radioSpins: "12,500",
  radioTrend: "-2.3%"
};

export const MOCK_GEO_DATA = [
  { country: "MX", value: 3500000 },
  { country: "US", value: 2100000 },
  { country: "BR", value: 1800000 },
  { country: "CO", value: 1500000 },
  { country: "AR", value: 900000 },
];

export const MOCK_GEO_CITIES = [
  { city: "Mexico City", country: "Mexico", streams: 1200000 },
  { city: "Bogota", country: "Colombia", streams: 850000 },
  { city: "Sao Paulo", country: "Brazil", streams: 700000 },
  { city: "Los Angeles", country: "USA", streams: 450000 },
  { city: "Buenos Aires", country: "Argentina", streams: 400000 },
];

export const MOCK_OVERLAP_DATA = [
  { artist: "Artist A", overlap: 65, color: "#f04f23" },
  { artist: "Artist B", overlap: 45, color: "#ff6840" },
  { artist: "Artist C", overlap: 30, color: "#d9431c" },
  { artist: "Artist D", overlap: 20, color: "#f87171" },
  { artist: "Artist E", overlap: 15, color: "#fca5a5" },
];

export const MOCK_RELEASE_DATA = [
  { day: "Day 1", releaseA: 10000, releaseB: 12000, releaseC: 8000 },
  { day: "Day 3", releaseA: 25000, releaseB: 28000, releaseC: 18000 },
  { day: "Day 7", releaseA: 45000, releaseB: 42000, releaseC: 30000 },
  { day: "Day 14", releaseA: 80000, releaseB: 70000, releaseC: 50000 },
];

export const MOCK_DEMO_DATA = {
  age: [
    { range: '14-17', value: 15 },
    { range: '18-24', value: 45 },
    { range: '25-34', value: 25 },
    { range: '35+', value: 15 }
  ],
  gender: [
    { type: 'Female', value: 60 },
    { type: 'Male', value: 35 },
    { type: 'Non-binary', value: 5 }
  ]
};
