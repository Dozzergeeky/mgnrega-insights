# Loom Walkthrough Script (< 2 minutes)

0:00 — Intro
- Hello! This is “Our Voice | MGNREGA Insights”. It makes complex MGNREGA data simple for rural citizens.
- Built for low-literacy users: big text, icons, bilingual copy, and audio-ready content.

0:15 — Problem and Goal
- Problem: The official data.gov.in API is hard to understand and unreliable under scale.
- Goal: Show district performance now and over time, simply and reliably, even during API outages.

0:25 — Live Demo
- Landing page: Clear headline and bilingual trust badge. Click "Select District".
- District picker: Manual selection plus "Detect My District" using browser location (validates WB bounds).
- Click "Continue to Dashboard" → dashboard loads with real-time data fetching and smooth loading state.

0:45 — Dashboard Highlights
- Four key metrics:
  - Work Demand (person-days)
  - Wage Payments (₹)
  - Completion Rate (%)
  - Project Summary (completed vs total)
- 6-month historical trend shows progress over time.
- Designed for low literacy: minimal text, color cues, large tap targets.

1:05 — Architecture
- Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui.
- Client-side dashboard with Suspense boundaries for optimal UX.
- API endpoints: /api/districts, /api/dashboard, /api/history, /api/health.
- Data flow:
  1) Neon Postgres (optional, for districts) with serverless driver.
  2) MongoDB (primary) with connection pooling and durable storage.
  3) Realistic mock fallback if DB/API unavailable (ensures 100% uptime).
  4) Client-side data fetching with loading states and error handling.

1:20 — Real Data Integration
- `fetchMonthlyDistrictPerformance()` hits data.gov.in with correct filters, month names, and fin year.
- Sync script stores raw records per district-month in MongoDB (district_metrics).
- Districts can be read from Neon Postgres (if configured) or MongoDB/static fallback.
- Dashboard fetches data client-side with useEffect; shows loading spinner; falls back to mock when needed → 100% availability.

1:35 — Production Readiness
- Deployed on Vercel (https://mgnrega-2n74in54e-dozzergeekys-projects.vercel.app).
- GitHub: https://github.com/Dozzergeeky/mgnrega-insights
- Works on Vercel or VPS, with optional cron-based sync.
- Environment validated with Zod, strict TypeScript, Playwright E2E.
- Optional Neon Postgres for serverless database (configured via POSTGRES_URL).
- See DATA-INTEGRATION.md, DEPLOYMENT.md, PRODUCTION-CHECKLIST.md.

1:50 — Close
- Impact: Accessible insights for 12.15 Cr Indians.
- I’ll share the hosted URL and repo link below. Thank you!

## Handy File Pointers
- Home: `src/app/page.tsx`
- District Picker: `src/components/district-picker.tsx`
- Dashboard: `src/app/dashboard/page.tsx`
- APIs: `src/app/api/*/route.ts`
- Env validation: `src/lib/env.ts`
- Data gov.in client: `src/lib/mgnrega.ts`
