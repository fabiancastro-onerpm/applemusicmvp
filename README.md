# 🎵 ONErpm Apple Command Center

> **Internal Analytics Dashboard** — Apple Music real-time intelligence platform for ONErpm Canada's A&R and marketing teams.

A Next.js MVP that connects directly to the **Apple Music Analytics API (v4)** to deliver live audience data for any artist signed to ONErpm. Query by Adam ID and instantly visualize streams, listeners, geographic distribution, age demographics, and more.

---

## 🚀 Live Features (MVP v1.0)

### 🎯 Artist Overview
**Route:** `/`

The command center starting point. Input any Apple Adam ID and select a time range to generate a full report.

**Real data pulled from Apple:**
- **Total Streams** — Cumulative `play_count` for the selected period (7 days / 28 days / 90 days / 365 days).
- **Active Listeners** — Unique `listener_count`, distinct users who played the artist's catalog.
- **Artist Name Resolution** — Automatic reverse lookup via iTunes public API to display the artist's name alongside the Adam ID.

**Use cases:**
- Quick sanity check on an artist's Apple Music footprint before a pitch meeting.
- Compare performance across time ranges to measure impact of a release or campaign.
- First point of contact for A&R teams evaluating catalog health.

---

### 🌍 Global Distribution
**Route:** `/` (embedded) and `/geo`

A bar chart rendering the **Top 10 countries** by stream volume, pulled live from Apple's `storefront` dimension.

**Real data pulled from Apple:**
- Country-level `play_count` grouped by `storefront` (Apple's internal country code).
- Top cities ranked by listener density using `consumer_city` dimension.

**Use cases:**
- Identify which territories are driving organic discovery.
- Evaluate where to prioritize playlist pitching or marketing budget.
- Detect unexpected breakout markets before they peak.
- Inform tour routing and promoter conversations.

---

### 👤 Age Segmentation
**Route:** `/` (embedded) and `/geo`

Horizontal bar chart displaying the percentage breakdown of listeners by age bucket, sourced directly from Apple's `age_bucket` dimension.

**Real data pulled from Apple:**
- Age groups: `14-17`, `18-24`, `25-34`, `35-44`, `45-54`, `55-64`, `65+`
- Displayed as percentage of total plays for the selected period.

> **Note:** Apple restricts gender data via their privacy policies. Gender breakdown shown is a visual placeholder for the MVP.

**Use cases:**
- Understand your core audience age profile for ad targeting.
- Detect generational drift — is an artist aging up or attracting new youth listeners?
- Match editorial playlist pitching to the right demographic segments.
- Build audience personas for sync licensing and brand partnership proposals.

---

### 🏙️ Top Cities
**Route:** `/` (embedded) and `/geo`

Ranked list of the top 5 cities by stream count with proportional visual bars.

**Real data pulled from Apple:**
- City name parsed from Apple's `consumer_city_name` format (e.g. `"Bogotá, Cundinamarca, CO"`).
- Sorted descending by `play_count`.

**Use cases:**
- Spot hyperlocal fanbase concentrations for regional media outreach.
- Align release campaigns with city-specific event calendars.
- Feed data into Spotify for Artists city targeting or TikTok geo-boosting.

---

### 🔀 Audience Affinity (Overlap)
**Route:** `/overlap`

Visual representation of shared listeners between the queried artist and other ONErpm roster members.

> **Status:** v1.1 feature — Current view shows illustrative mock data. Full implementation requires cross-artist lookups via the `audience-overlap` Apple endpoint + iTunes reverse ID resolution.

**Planned functionality:**
- POST to `https://musicanalytics.apple.com/v4/queries/audience-overlap` with two artist IDs.
- Identify % of shared listeners between Label artists.
- Rank affinity by overlap score.

**Use cases:**
- Build co-headlining tour strategies based on real listener crossover.
- Identify ideal collaboration candidates within the roster.
- Package artists together for editorial playlist family pitching.
- Inform cross-promotional campaigns on social media.

---

### 📈 Release Trajectory
**Route:** `/tracker`

Line chart comparing the streaming performance curve of an artist's latest release vs. previous release vs. catalog average — across the first 14 days post-release.

> **Status:** v1.1 feature — Current view shows illustrative mock data. Full implementation requires individual `song_id` lookups per track and daily granularity queries.

**Planned functionality:**
- Query Apple's `audience-engagement` API per `song_id` with a daily `group_by`.
- Normalize curves to Day 1 = 100% for apples-to-apples comparison.
- Automatically detect the latest 2-3 releases via iTunes catalog lookup.

**Use cases:**
- Evaluate release trajectory health in the first critical 72-hour window.
- Compare rollout strategies across campaigns (single drop vs. album cycle).
- Justify marketing spend extensions when a release shows late-bloomer curves.
- Benchmark new signings against catalog average performance.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | JSON Web Token (ES256 / App Store Connect v1) |
| API | Apple Music Analytics API v4 |

---

## ⚙️ Setup & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/fabiancastro-onerpm/applemusicmvp.git
cd applemusicmvp
npm install
```

### 2. Configure environment variables
Create a `.env.local` file in the root of the project:

```env
APPLE_KEY_ID=your_key_id_here
APPLE_UUID=your_issuer_uuid_here
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----"
```

> ⚠️ **Important:** The `APPLE_PRIVATE_KEY` must have literal `\n` characters where the line breaks are in your `.p8` file. Do NOT paste the key as multiline in the `.env.local` — keep it as a single string with `\n` escape sequences.

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel
Add the same three environment variables (`APPLE_KEY_ID`, `APPLE_UUID`, `APPLE_PRIVATE_KEY`) in your Vercel project settings under **Settings → Environment Variables**, then push to `main`.

---

## 🔐 Authentication

This dashboard uses **App Store Connect API JWT authentication** (ES256 algorithm), not the public Apple Music token. Key requirements:

- `iss`: Must be the UUID/Issuer ID from App Store Connect (not the Team ID).
- `aud`: Must be `appstoreconnect-v1`.
- `exp`: Maximum 20 minutes from issue time (we use 15 min for safety).
- Key format: Must be an **ES256 PKCS#8 private key** (the `.p8` file from Apple).

---

## 🗺️ Roadmap

| Version | Feature |
|---|---|
| ✅ v1.0 | Streams, Listeners, Geo, Age Demographics |
| 🔜 v1.1 | Audience Overlap (real data), Release Trajectory (real data) |
| 🔜 v1.2 | Multi-artist comparison, CSV export |
| 🔜 v1.3 | Automated weekly digest email per artist |
| 🔜 v2.0 | Full roster grid — all ONErpm CAN artists in a single view |

---

## 📁 Project Structure

```
app/
├── api/apple/route.ts     # Secure backend proxy — all Apple API calls live here
├── geo/page.tsx           # Standalone Geo Tracking page
├── overlap/page.tsx       # Audience Match page
├── tracker/page.tsx       # Release Tracker page
├── page.tsx               # Main Artist Overview dashboard
├── layout.tsx             # Root layout with Sidebar
└── globals.css            # Design system & Tailwind base

components/
├── ArtistHub.tsx          # KPI cards (Streams, Listeners, Shazams, Radio)
├── GeoMap.tsx             # Country bar chart + Top Cities list
├── DemoBreakdown.tsx      # Age segmentation + Gender distribution
├── AudienceOverlap.tsx    # Affinity bar chart
├── ReleaseTracker.tsx     # Release curve line chart
└── Sidebar.tsx            # Navigation with active state

lib/
├── apple-auth.ts          # JWT token generator for App Store Connect
└── mock-data.ts           # Fallback data for non-live sections
```

---

## 👥 Team

Built by the **ONErpm Canada Digital Strategy & Analytics** team in partnership with **Antigravity**.

---

*Internal use only. Do not distribute credentials or share the `.env.local` file.*
