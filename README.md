# ONErpm Apple Music Analytics MVP 🍎🚀

A high-intelligence A&R dashboard designed for professional music executives. This MVP transforms raw Apple Music Analytics data into actionable intelligence, featuring deep playlist tracking and AI-driven artist insights.

## ✨ Key Features

- **Playlist Journey (A&R Intelligence)**: Track track-level performance across all playlists. Includes a "Deep Scraper" that retrieves official covers and titles even for obscure/user-generated lists.
- **Audience Overlap (Gemini AI)**: Integrated with Google Gemini 2.5 Flash to provide strategic A&R insights on artist collaborations and fan-base synergy.
- **Granular Metrics**: Real-time analysis of Streams vs. Listeners, Global Distribution, Demographics, and Audio Format quality.
- **Privacy First**: Fully operational as a standalone dashboard with local session security.
- **Custom Overrides**: Allows A&R managers to manually "bridge" missing metadata for a 100% visual experience during presentations.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (Premium Aesthetic)
- **APIs**:
  - Apple Music Analytics API (v4)
  - iTunes Search API (Metadata enrichment)
  - Google Gemini 2.5 Flash (AI Insights)

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fabiancastroch/applemusicmvp.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file based on `.env.example` with your Apple Developer and Gemini credentials.

4. **Run development mode**:
   ```bash
   npm run dev
   ```

## 📈 Benefits for ONErpm

- **Strategic Decision Making**: Identify exactly which tracks are driving playlist growth.
- **Automated Reporting**: No more manual spreadsheet mapping for Apple Analytics.
- **AI Collaboration Scouting**: Leverage LLMs to find the perfect collaboration match based on fan behavior.

---
*Developed for ONErpm A&R and Project Management teams.*
