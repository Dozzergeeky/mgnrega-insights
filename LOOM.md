# Loom Walkthrough Script (< 2 minutes)

## Mac Recording Guide (Pro Setup)

### Best Recording Tools for Mac

#### 🏆 Recommended: Loom Desktop App

- Download: [loom.com/download](https://www.loom.com/download)
- Highlights:
  - Camera bubble adds personal presence.
  - Auto-upload with shareable links immediately after recording.
  - Click highlighting and drawing tools for emphasis.
  - Built-in trimming and basic editing.
  - 1080p exports on the free tier with no watermark.

#### Alternative Pro Tools

| Tool | Price | Best for |
| --- | --- | --- |
| ScreenFlow | $169 | Professional editing with multi-track timelines and effects |
| Camtasia | $299 | Beginner-friendly templates and green-screen support |
| QuickTime Player | Free | Lightweight captures without post-production |
| OBS Studio | Free | Advanced scenes, overlays, and live-stream capability |

---

### Optimal Recording Settings

#### Resolution

```text
✅ Best: 1920x1080 @ 30fps (Full HD)
✅ Good: 1440x900 @ 30fps (MacBook 13")
❌ Avoid: 4K (unnecessarily large files)
```

#### Audio

```text
Microphone: Built-in Mac mic is fine (avoid AirPods to prevent latency)
Levels: Target -12 dB to -6 dB; record a 10-second sample to confirm
Environment: Quiet room, windows closed, notifications muted
```

#### Browser Setup

```text
Browser: Chrome or Safari in a regular window (not full-screen)
Zoom: 100–110 % for readability
Bookmarks bar: toggle with ⌘+Shift+B
Mode: Incognito/Private to hide extensions and saved sessions
```

---

### Make It Look Professional

#### System Tweaks

##### 1. Cursor Visibility (most important)

- System Settings → Accessibility → Display → Pointer.
- Enable “Shake mouse pointer to locate”.
- Optional: install [Mouseposé](https://www.boinx.com/mousepose/) (≈ $5) for a spotlight effect.

##### 2. Clean Desktop

- Right-click the desktop and choose **Use Stacks**, or hide icons temporarily:

```bash
defaults write com.apple.finder CreateDesktop false
killall Finder
```

- Restore later with:

```bash
defaults write com.apple.finder CreateDesktop true
killall Finder
```

##### 3. Hide Menu Bar Clutter

- Use [Bartender](https://www.macbartender.com/) (≈ $16) or [Hidden Bar](https://github.com/dwarvesf/hidden) (free) to tuck menu icons away.
- Alternatively, open System Settings → Control Center and set rarely used items to “Do not show”.

##### 4. Disable Notifications

- Turn on **Do Not Disturb** from Control Center or press ⌘+Shift+D.
- Quit Slack, Discord, Messages, Mail, and any other chat apps.

##### 5. Increase Display Text Size

- System Settings → Displays → Resolution → “Scaled” → choose **Larger Text** or **More Space**.
- Helps viewers read UI elements comfortably.

#### VS Code Polish

- Theme: “GitHub Dark Default” or “One Dark Pro” for clear contrast.
- Font size: 16–18 px (`Preferences → Text Editor → Font Size`).
- Hide the minimap via **View → Appearance → Hide Minimap**.
- Toggle the sidebar with ⌘+B when presenting code.
- Use Zen Mode (⌘+K Z) for distraction-free focus.

#### Browser Tweaks

- Apply 110 % zoom (⌘+ once) for legibility.
- Dock DevTools to the right if you need to show them.
- Close unrelated tabs and keep the demo flow tidy.
- Disable extensions or rely on the incognito window.

---

### Professional Recording Workflow

#### Pre-flight Checklist (5 minutes)

- [ ] Close all apps except the browser and VS Code.
- [ ] Enable Do Not Disturb (⌘+Shift+D).
- [ ] Record a 10-second audio clip and adjust levels.
- [ ] Ensure the cursor highlight is visible.
- [ ] Open every tab and file you plan to show.
- [ ] Clear browser cache and cookies.
- [ ] Complete one dry run of the script.

#### During Recording

- Speak first, act second: “I’ll click Select District” → pause → click.
- Move the cursor deliberately (about half your normal speed).
- Pause for one beat between sections for easier editing.
- Use keyboard shortcuts (⌘+Tab, ⌘+T) to keep the flow smooth.
- If you slip, pause three seconds and redo the line—easy to trim.

#### Post-recording (Loom)

1. Trim dead air at the beginning and end.
2. Add a call-to-action: "Links are below 👇".
3. Select a custom thumbnail (dashboard screenshot).
4. Add chapter markers:
   - 0:00 Intro
   - 0:15 Problem
   - 0:25 Demo
   - 0:50 Dashboard
   - 1:15 Architecture
   - 1:40 Deployment

---

### 🎬 Pro Speaking Tips

#### Do

- Smile while you talk—it genuinely improves tone.
- Use “we” instead of “I” to sound team-oriented.
- Sprinkle enthusiasm: “This part is especially powerful…”.
- Add intentional pauses: “Now… let’s see what happens when…”.
- Breathe and keep water nearby.

#### Don’t

- Rely on filler words (“um”, “uh”, “like”)—silent pauses are better.
- Apologize for minor hiccups.
- Read the script verbatim; aim for a conversational tone.
- Rush through code; give viewers time to absorb it.

---

### 📋 Print-and-Tape Checklist

```text
PRE-RECORD
□ Do Not Disturb ON
□ Desktop cleaned or hidden
□ Cursor shake enabled
□ Audio levels in the green (-12 to -6 dB)
□ Browser zoom set to 110 %
□ VS Code font size ≥ 16 px
□ Required tabs and files open
□ Browser cache cleared
□ Dry run complete

DURING
□ Speak first, act second
□ Steady cursor movement
□ Brief pauses between sections
□ Water within reach

POST
□ Trim head and tail
□ Add chapters
□ Set custom thumbnail
□ Test share link

You’ve got this! 🎬🚀
```

---

## Recording Instructions

### Setup

- Open the production app in a browser: [MGNREGA Insights VPS](http://172.105.36.247) (preferred for demo) or [Vercel](https://mgnrega-2n74in54e-dozzergeekys-projects.vercel.app)
- Have VS Code open with the key files ready (see Handy File Pointers below).
- Have screenshots folder open to reference visual examples.
- Clear the browser cache for a clean demo.
- Use a standard screen size (1920×1080 or 1440×900).

### Recording Tips

- Speak clearly and at a moderate pace.
- Move the cursor deliberately.
- Pause briefly between sections.
- Keep the final video under two minutes.
- Run through the script once before recording.

---

## Script

0:00 — Intro
**[SHOW: Production homepage at http://172.105.36.247]**

- Hello! This is "Our Voice | MGNREGA Insights". It makes complex MGNREGA data simple for rural citizens.
- Built for low-literacy users: big text, icons, bilingual copy, and audio-ready content.

0:15 — Problem and Goal
**[SHOW: Briefly switch to data.gov.in raw API response in browser tab]**

- Problem: The official data.gov.in API is hard to understand and unreliable under scale.
**[SWITCH BACK: To production app homepage]**

- Goal: Show district performance now and over time, simply and reliably, even during API outages.

0:25 — Live Demo: Smart Location Detection
**[SHOW: Home page with district picker section visible]**

- Landing page: Clear headline and bilingual trust badge.
**[SCROLL TO: District picker section showing the two location detection buttons]**

- NEW: Two ways to detect your location automatically:
  - **"🌍 Detect via IP"** - Works on HTTP, no permissions needed, instant city-level detection
  - **"📍 GPS (Precise)"** - More accurate but requires HTTPS and browser permission
**[ACTION: Click "🌍 Detect via IP" button]**
**[SHOW: Success message appears showing detected district]**
- IP detection identifies your district instantly using ipapi.co - no HTTPS required!
**[ACTION: Alternatively show the manual district dropdown, scroll through a few districts]**
- Or select manually from all 23 West Bengal districts.
**[ACTION: Click "Continue to Dashboard" with Kolkata selected]**
**[SHOW: Loading spinner briefly, then dashboard loads with data]**
- Dashboard loads with smooth transitions and real-time data fetching.

0:50 — Dashboard Highlights
**[SHOW: Dashboard with all metrics visible, hover over each card as you mention it]**

- Six key metric cards with icons and color coding:
  - Total Works (Work Demand with person-days)
  - Wage Payments (₹)
  - Work Completion Rate (Person-days completed %)
  - Worker Engagement (Active vs Total Workers %)
  - Job Card Activation Rate
  - Average Wage per Worker
**[SCROLL DOWN: Show the Worker Engagement Distribution pie chart]**
**[ACTION: Hover over pie chart segments]**
- Visual pie chart showing Active vs Inactive workers with percentage breakdown
- Interactive tooltips display exact worker counts in each segment
**[SCROLL DOWN: Show the Multi-Metric Performance Trend chart with 3M/6M/1Y buttons]**
**[ACTION: Click time range buttons to show dynamic switching]**
- Interactive time range selector: Switch between 3 months, 6 months, or 1 year
- Chart updates instantly without page reload - optimized for performance
**[ACTION: Hover over chart lines to show tooltips with month details]**
- Hover over data points to see detailed monthly breakdown with all three metrics
- Multi-metric line chart tracking completion rate, wages, and active workers simultaneously
**[SHOW: Dashed lines vs solid lines in the chart]**
- Visual distinction: Dashed lines = interpolated estimates; Solid lines = real data from data.gov.in
- Amber badge displays data quality: "X% Real Data (Y months estimated)"
- Currently showing 50% real historical data (6 out of 12 months)
- Month labels are color-coded: gray for real data, amber for interpolated months
**[PAN CAMERA: Show overall layout including back button and responsive design]**
- Clean, accessible design: minimal text, color cues, large tap targets for low-literacy users.

1:15 — Architecture
**[SWITCH TO: VS Code with src/app/dashboard/page.tsx open]**
**[SCROLL THROUGH: Show client component with Suspense, useEffect, useState]**

- Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui.
- Client-side dashboard with Suspense boundaries for optimal UX.
**[SWITCH TO: src/components/district-picker.tsx]**
**[HIGHLIGHT: IP detection function using ipapi.co]**
- NEW: IP-based geolocation using ipapi.co API - works on HTTP without browser permissions
**[SWITCH TO: src/app/api/dashboard/route.ts]**
**[HIGHLIGHT: API endpoint structure]**

- API endpoints: /api/districts, /api/dashboard, /api/history, /api/health.
**[SHOW: Quickly tab through each API file]**

- Data flow:
  1) Neon Postgres (optional, for districts) with serverless driver.
  2) MongoDB (primary) with connection pooling and durable storage.
  3) Realistic mock fallback if DB/API unavailable (ensures 100% uptime).
  4) Client-side data fetching with loading states and error handling.

1:30 — Real Data Integration
**[SWITCH TO: src/lib/mgnrega.ts]**
**[SCROLL TO: fetchMonthlyDistrictPerformance function]**

- `fetchMonthlyDistrictPerformance()` hits data.gov.in with correct filters, month names, and fin year.
**[SHOW: scripts/sync-mgnrega.ts briefly]**

- Sync script stores raw records per district-month in MongoDB (district_metrics).
**[SHOW: src/lib/districts.ts with Postgres integration]**

- Districts can be read from Neon Postgres (if configured) or MongoDB/static fallback.
**[SWITCH BACK: To dashboard in browser]**

- Dashboard fetches data client-side with useEffect; shows loading spinner; falls back to mock when needed → 100% availability.

1:40 — Production Readiness
**[SHOW: Browser address bar highlighting the VPS URL]**

- Deployed on Linode VPS ([http://172.105.36.247](http://172.105.36.247)) and Vercel ([production deployment](https://mgnrega-2n74in54e-dozzergeekys-projects.vercel.app)).
**[OPEN NEW TAB: Show /api/health endpoint]**

- Health endpoint returns real-time status: `{"status":"ok","timestamp":"..."}`
**[OPEN SSH/TERMINAL: Show monitoring logs briefly]**

- Enterprise-grade operations:
  - **Automated health monitoring** every 5 minutes with self-healing
  - **Daily MongoDB backups** at 3 AM UTC (7-day retention)
  - **Daily data sync** from data.gov.in at 2 AM UTC
  - **Webhook alerting** for critical failures (Discord/Slack compatible)
  - **Boot resilience** - all services start automatically on reboot

**[SHOW: Terminal running `tail -20 /home/dozzer/mgnrega-app/logs/health.log`]**

- Real-time monitoring logs show app health, disk usage, MongoDB status, PM2 processes
- System automatically restarts failed services

**[SWITCH TO: File explorer showing documentation files]**

- Comprehensive documentation:
  - **README.md** - Application features and development
  - **OPERATIONS.md** - Complete operations guide (NEW - 300+ lines)
  - **DEPLOYMENT.md** - Deployment instructions
  - **DATA-INTEGRATION.md** - Real data setup

**[SHOW: scripts/ directory with key operational scripts]**

- 34 deployment automation scripts for easy server management
- One-command operations: restart app, check health, run backups, sync data

**[OPEN NEW TAB: Show GitHub repo quickly]**

- GitHub: [Dozzergeeky/mgnrega-insights](https://github.com/Dozzergeeky/mgnrega-insights).

**[SHOW: Crontab output]**

- Five automated cron jobs keep the system running:
  1. Data sync (daily 2 AM)
  2. MongoDB backup (daily 3 AM)
  3. Health monitoring (every 5 min)
  4. Alert checking (every 5 min)
  5. Daily health summary (9 AM)

1:55 — Close
**[SWITCH BACK: To production dashboard showing full page]**

- Impact: Accessible insights for 12.15 Cr Indians.
**[SHOW: GitHub repo URL in browser tab]**

- I'll share the hosted URL and repo link below. Thank you!

**[END RECORDING]**

## Handy File Pointers

- Home: `src/app/page.tsx`
- District Picker: `src/components/district-picker.tsx`
- Dashboard: `src/app/dashboard/page.tsx`
- APIs: `src/app/api/*/route.ts`
- Env validation: `src/lib/env.ts`
- Data gov.in client: `src/lib/mgnrega.ts`
