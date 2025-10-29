# Loom Walkthrough Script (< 2 minutes)

0:00 — Intro
- Hello! This is “Our Voice | MGNREGA Insights”. It makes complex MGNREGA data simple for rural citizens.
- Built for low-literacy users: big text, icons, bilingual copy, and audio-ready content.

0:15 — Problem and Goal
- Problem: The official data.gov.in API is hard to understand and unreliable under scale.
- Goal: Show district performance now and over time, simply and reliably, even during API outages.

0:25 — Live Demo
- Landing page: Clear headline and bilingual trust badge. Tap “Select District”.
- District picker: Manual selection plus “Detect My District” using browser location.
- Tap “Preview dashboard” → dashboard for the selected district loads instantly.

0:45 — Dashboard Highlights
- Four key metrics:
  - Work Demand (person-days)
  - Wage Payments (₹)
  - Completion Rate (%)
  - Project Summary (completed vs total)
- 6-month historical trend shows progress over time.
- Designed for low literacy: minimal text, color cues, large tap targets.

1:05 — Architecture
- Next.js 16 App Router + Tailwind v4 + shadcn/ui.
- API endpoints: /api/districts, /api/dashboard, /api/history, /api/health.
- Data flow:
  1) MongoDB (primary) with connection pooling and durable storage.
  2) Realistic mock fallback if DB/API unavailable (ensures uptime).
  3) Server-side aggregation for fast page loads.

1:20 — Real Data Integration
- `fetchMonthlyDistrictPerformance()` hits data.gov.in with correct filters, month names, and fin year.
- Sync script stores raw records per district-month in MongoDB (district_metrics).
- Dashboard aggregates on-the-fly; falls back to mock when needed → 100% availability.

1:35 — Production Readiness
- Works on Vercel or VPS, with cron-based sync option.
- Environment validated with Zod, strict TypeScript, Playwright E2E.
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
