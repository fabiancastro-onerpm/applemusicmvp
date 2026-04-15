# Apple Music Intelligence Hub (MVP)

A professional, high-granularity data analytics tool for artists and tracks, specifically designed for music industry stakeholders, including A&R, Project Managers, Marketing, and Data Analysts.

This MVP provides deep real-time metrics directly from the Apple Music Analytics API, enabling strategic decision-making based on actual audience behavior.

## 🚀 Key Benefits

- **Extreme Granularity**: Visualize streams by city, device, audio format, and subscription type.
- **Audience Affinity (Overlap)**: Identify audience overlap between artists to detect collaboration opportunities.
- **AI-Powered A&R Insights**: Generate actionable recommendations using Gemini AI (1.5 Flash) to interpret affinity data.
- **Playlist Journey**: Detailed tracking of playlist impact on artist consumption with a deep metadata recovery engine.
- **Premium Interface**: Centralized dashboard with intuitive navigation and dynamic visualizations.

## 🛠 Technical Configuration

To run this project locally, ensure you set the following environment variables in a `.env.local` file:

```env
# Apple Music API Credentials
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----"
APPLE_UUID=your_issuer_id
APPLE_CONTENT_PROVIDER_ID=your_provider_id

# Gemini AI (For A&R Insights)
GEMINI_API_KEY=your_gemini_api_key
```

## 📦 Installation and Usage

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open in your browser: `http://localhost:3000`

---
*Developed for ONErpm by the Advanced Analytics team.*
