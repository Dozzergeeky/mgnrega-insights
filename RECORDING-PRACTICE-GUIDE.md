# 🎬 Recording Practice Guide & Pre-Flight Checklist

## Part 1: Script Practice Review

### 📝 Practice Tips for Each Section

#### **0:00–0:15 — Intro (15 seconds)**
**What to say:**
> "Hello! This is 'Our Voice | MGNREGA Insights'. It makes complex MGNREGA data simple for rural citizens. Built for low-literacy users: big text, icons, bilingual copy, and audio-ready content."

**Practice notes:**
- ✅ Speak clearly and confidently
- ✅ Emphasize "simple" and "low-literacy users"
- ✅ Keep cursor steady on the homepage
- ⏱️ Target: 12-15 seconds

**Common mistakes to avoid:**
- ❌ Rushing through the app name
- ❌ Forgetting to mention "bilingual"
- ❌ Moving cursor too much

---

#### **0:15–0:25 — Problem and Goal (10 seconds)**
**What to say:**
> "Problem: The official data.gov.in API is hard to understand and unreliable under scale. [PAUSE] Goal: Show district performance now and over time, simply and reliably, even during API outages."

**Practice notes:**
- ✅ Quick tab switch to data.gov.in raw JSON
- ✅ Tab back to homepage within 2 seconds
- ✅ Pause between "Problem" and "Goal"
- ⏱️ Target: 8-10 seconds

**Common mistakes to avoid:**
- ❌ Spending too long on data.gov.in
- ❌ Getting distracted by the raw JSON
- ❌ Not returning to homepage

---

#### **0:25–0:50 — Live Demo: Smart Location Detection (25 seconds)**
**What to say:**
> "Landing page: Clear headline and bilingual trust badge. [SCROLL] NEW: Two ways to detect your location automatically: 'Detect via IP' - Works on HTTP, no permissions needed, instant city-level detection. And 'GPS Precise' - More accurate but requires HTTPS and browser permission. [CLICK IP button] IP detection identifies your district instantly using ipapi.co - no HTTPS required! [SHOW dropdown] Or select manually from all 23 West Bengal districts. [CLICK Continue] Dashboard loads with smooth transitions and real-time data fetching."

**Practice notes:**
- ✅ Scroll smoothly to district picker section
- ✅ Hover over both buttons (IP and GPS) briefly
- ✅ Click "Detect via IP" and wait for success message
- ✅ Show dropdown with districts
- ✅ Select Kolkata and click Continue
- ⏱️ Target: 22-25 seconds

**Action sequence:**
1. Start at top of homepage
2. Scroll down to district picker (2 seconds)
3. Point to IP button (1 second)
4. Point to GPS button (1 second)
5. Click IP button (wait 2 seconds for result)
6. Show dropdown (2 seconds)
7. Select district + Click Continue (3 seconds)
8. Wait for dashboard to load (2 seconds)

**Common mistakes to avoid:**
- ❌ Clicking too fast without explanation
- ❌ Not waiting for IP detection success message
- ❌ Forgetting to mention "no HTTPS required"

---

#### **0:50–1:15 — Dashboard Highlights (25 seconds)**
**What to say:**
> "Six key metric cards with icons and color coding: Total Works, Wage Payments, Work Completion Rate at 99.99% showing excellent person-days completed, Worker Engagement, Job Card Activation, and Average Wage per Worker. [SCROLL] Visual pie chart showing Active vs Inactive workers with percentage breakdown. [HOVER] Interactive tooltips display exact worker counts. [SCROLL] Interactive time range selector: Switch between 3 months, 6 months, or 1 year. [CLICK buttons] Chart updates instantly without page reload. [HOVER] Multi-metric line chart tracking completion rate, wages, and active workers simultaneously. [POINT] Visual distinction: Dashed lines equal interpolated estimates; Solid lines equal real data from data.gov.in. Amber badge displays data quality: '50% Real Data'. Month labels are color-coded: gray for real data, amber for interpolated months."

**Practice notes:**
- ✅ Hover over each metric card briefly (1 second each)
- ✅ Scroll to pie chart, hover over segments
- ✅ Scroll to line chart
- ✅ Click 3M, then 6M, then 1Y buttons (wait 1 second between)
- ✅ Hover over chart lines to show tooltip
- ✅ Point to dashed vs solid lines
- ✅ Point to amber badge at top
- ⏱️ Target: 23-27 seconds

**Action sequence:**
1. Show top 6 cards (3 seconds)
2. Scroll to pie chart (2 seconds)
3. Hover over pie segments (3 seconds)
4. Scroll to line chart (2 seconds)
5. Click time range buttons (4 seconds)
6. Hover over chart lines (3 seconds)
7. Point to dashed/solid lines (3 seconds)
8. Point to amber badge (2 seconds)

**Common mistakes to avoid:**
- ❌ Rushing through the metric cards
- ❌ Not waiting for chart to update after clicking time range
- ❌ Forgetting to mention "dashed vs solid"
- ❌ Missing the amber badge

---

#### **1:15–1:30 — Architecture (15 seconds)**
**What to say:**
> "Next.js 16 App Router + React 19 + Tailwind v4 + shadcn/ui. Client-side dashboard with Suspense boundaries for optimal UX. [SWITCH] NEW: IP-based geolocation using ipapi.co API - works on HTTP without browser permissions. [SWITCH] API endpoints: /api/districts, dashboard, history, health. Data flow: Neon Postgres optional for districts, MongoDB primary with connection pooling, realistic mock fallback ensures 100% uptime, client-side data fetching with loading states."

**Practice notes:**
- ✅ Switch to VS Code with dashboard page open
- ✅ Scroll through key sections (Suspense, useEffect)
- ✅ Switch to district-picker.tsx and highlight IP detection function
- ✅ Switch to API route file
- ⏱️ Target: 13-16 seconds

**Common mistakes to avoid:**
- ❌ Spending too long scrolling through code
- ❌ Getting lost in VS Code
- ❌ Forgetting to mention "100% uptime"

---

#### **1:30–1:40 — Real Data Integration (10 seconds)**
**What to say:**
> "fetchMonthlyDistrictPerformance hits data.gov.in with correct filters, month names, and fin year. Sync script stores raw records per district-month in MongoDB. Districts can be read from Neon Postgres if configured, or MongoDB/static fallback. Dashboard fetches data client-side with useEffect, shows loading spinner, falls back to mock when needed for 100% availability."

**Practice notes:**
- ✅ Switch to mgnrega.ts file
- ✅ Quickly show sync script
- ✅ Show districts.ts
- ✅ Switch back to browser
- ⏱️ Target: 9-11 seconds

---

#### **1:40–1:55 — Production Readiness (15 seconds)**
**What to say:**
> "Deployed on Linode VPS and Vercel. [TAB] Health endpoint returns real-time status. [TERMINAL] Enterprise-grade operations: Automated health monitoring every 5 minutes with self-healing, daily MongoDB backups at 3 AM UTC with 7-day retention, daily data sync from data.gov.in at 2 AM UTC, webhook alerting for critical failures, boot resilience with automatic service starts. [SHOW logs] Real-time monitoring logs show app health, system automatically restarts failed services. [FILE EXPLORER] Comprehensive documentation: README, OPERATIONS guide with 300+ lines, DEPLOYMENT, DATA-INTEGRATION. [SCRIPTS] 34 deployment automation scripts for easy server management. [GITHUB] GitHub repo. [CRONTAB] Five automated cron jobs keep the system running: Data sync daily 2 AM, MongoDB backup daily 3 AM, health monitoring every 5 min, alert checking every 5 min, daily health summary 9 AM."

**Practice notes:**
- ✅ Show browser address bar with VPS URL
- ✅ Open /api/health in new tab (1 second)
- ✅ Show terminal with logs (2 seconds)
- ✅ Show file explorer with docs (2 seconds)
- ✅ Show scripts folder (1 second)
- ✅ Show GitHub repo (1 second)
- ⏱️ Target: 13-16 seconds

---

#### **1:55–2:00 — Close (5 seconds)**
**What to say:**
> "Impact: Accessible insights for 12.15 Crore Indians. I'll share the hosted URL and repo link below. Thank you!"

**Practice notes:**
- ✅ Switch back to dashboard in browser
- ✅ Show full page with all data
- ✅ End with confident tone
- ⏱️ Target: 4-6 seconds

---

## Part 2: Pre-Recording Verification Checklist

### ✅ System Setup (5 minutes before recording)

#### **macOS Configuration**
- [ ] Enable Do Not Disturb (⌘+Shift+D)
- [ ] Quit all chat apps (Slack, Discord, Messages, Mail)
- [ ] Clean desktop or hide icons (`defaults write com.apple.finder CreateDesktop false && killall Finder`)
- [ ] Hide menu bar clutter (use Bartender/Hidden Bar)
- [ ] Enable cursor shake to locate (System Settings → Accessibility → Display → Pointer)
- [ ] Increase display text size if needed (System Settings → Displays → Scaled → Larger Text)

#### **Audio Setup**
- [ ] Use built-in Mac mic (avoid AirPods for latency)
- [ ] Record 10-second audio sample
- [ ] Check levels are -12 dB to -6 dB (green zone)
- [ ] Close windows, turn off fans, minimize background noise

---

### ✅ Application Setup (3 minutes before recording)

#### **Browser Configuration**
- [ ] Open Chrome or Safari in regular window (not full-screen)
- [ ] Set browser zoom to 110% (⌘+ once)
- [ ] Use Incognito/Private mode to hide extensions
- [ ] Hide bookmarks bar (⌘+Shift+B)
- [ ] Clear browser cache and cookies

#### **Required Browser Tabs (Open in this order)**
1. [ ] **Tab 1:** Production homepage - http://172.105.36.247
2. [ ] **Tab 2:** data.gov.in API sample - https://api.data.gov.in/resource/...
3. [ ] **Tab 3:** Production dashboard (keep ready) - http://172.105.36.247/dashboard?district=WB001&name=Kolkata
4. [ ] **Tab 4:** Health endpoint - http://172.105.36.247/api/health
5. [ ] **Tab 5:** GitHub repo - https://github.com/Dozzergeeky/mgnrega-insights

#### **VS Code Configuration**
- [ ] Open project: `/Users/dozzer/Library/CloudStorage/OneDrive-TechnoIndiaGroup/Dev/Projects/BoB/mgnrega-app`
- [ ] Theme: "GitHub Dark Default" or "One Dark Pro"
- [ ] Font size: 16-18 px (Preferences → Text Editor → Font Size)
- [ ] Hide minimap (View → Appearance → Hide Minimap)
- [ ] Sidebar visible (⌘+B to toggle if needed)

#### **Open These Files in VS Code (in this order)**
1. [ ] `src/app/dashboard/page.tsx` (main dashboard)
2. [ ] `src/components/district-picker.tsx` (IP detection)
3. [ ] `src/app/api/dashboard/route.ts` (API endpoints)
4. [ ] `src/lib/mgnrega.ts` (data.gov.in integration)
5. [ ] `scripts/sync-mgnrega.ts` (sync script)
6. [ ] `src/lib/districts.ts` (Postgres integration)

#### **Terminal Setup**
- [ ] Open Terminal app
- [ ] SSH into VPS: `ssh dozzer@172.105.36.247`
- [ ] Navigate to logs: `cd ~/mgnrega-app/logs`
- [ ] Prepare command: `tail -20 health.log` (don't run yet)
- [ ] Prepare crontab command: `crontab -l` (don't run yet)

#### **File Explorer Setup**
- [ ] Open Finder
- [ ] Navigate to project root: `/Users/dozzer/Library/CloudStorage/OneDrive-TechnoIndiaGroup/Dev/Projects/BoB/mgnrega-app`
- [ ] Keep documentation files visible (README.md, OPERATIONS.md, etc.)
- [ ] Open `scripts/` folder in separate window

---

### ✅ Content Verification (2 minutes before recording)

#### **Test Application Functionality**
- [ ] Homepage loads correctly at http://172.105.36.247
- [ ] "Detect via IP" button is visible and functional (test once)
- [ ] District dropdown shows all 23 West Bengal districts
- [ ] Select "Kolkata" from dropdown
- [ ] Click "Continue to Dashboard" - verify it loads
- [ ] Dashboard shows all 6 metric cards
- [ ] Pie chart is visible and interactive
- [ ] Time range buttons (3M/6M/1Y) are clickable
- [ ] Chart shows dashed and solid lines
- [ ] Amber badge shows data quality percentage
- [ ] All tooltips work when hovering

#### **Test VPS Resources**
- [ ] VPS is online and responsive
- [ ] MongoDB is running: `pm2 status` shows 'mgnrega-app' online
- [ ] Health endpoint returns: `curl http://172.105.36.247/api/health`
- [ ] Logs are recent: `ls -lh ~/mgnrega-app/logs/health.log`

---

### ✅ Recording Tool Setup (1 minute before recording)

#### **Loom Desktop App**
- [ ] Loom app is installed and logged in
- [ ] Recording mode: "Screen + Cam" or "Screen Only"
- [ ] Resolution: 1920x1080 @ 30fps (or 1440x900 for MacBook 13")
- [ ] Microphone selected: Built-in Microphone
- [ ] Camera bubble position: Bottom-right corner (if using cam)
- [ ] Test recording: Record 5 seconds and playback to verify audio/video

---

### ✅ Practice Run (5 minutes before recording)

#### **Dry Run Checklist**
- [ ] Read through entire script once (takes ~2 minutes)
- [ ] Practice transitions between browser and VS Code
- [ ] Practice clicking time range buttons smoothly
- [ ] Practice hovering over pie chart and line chart
- [ ] Practice terminal commands (don't execute, just type)
- [ ] Time yourself - aim for under 2 minutes total

#### **Timing Checkpoints**
- [ ] 0:15 - Finished intro, on Problem section
- [ ] 0:25 - Starting location detection demo
- [ ] 0:50 - Dashboard loaded, showing metrics
- [ ] 1:15 - Switched to VS Code architecture
- [ ] 1:30 - Showing real data integration
- [ ] 1:40 - Demonstrating production readiness
- [ ] 1:55 - Starting closing remarks
- [ ] 2:00 - Recording complete

---

### ✅ Final Pre-Flight Check (30 seconds before recording)

#### **Last-Minute Verification**
- [ ] Do Not Disturb is ON
- [ ] Browser tabs are in correct order
- [ ] VS Code files are open and ready
- [ ] Terminal is connected to VPS
- [ ] Cursor is positioned on homepage
- [ ] Loom is ready to record
- [ ] Water is nearby
- [ ] Script/notes are visible (second monitor or printed)
- [ ] Deep breath taken, ready to go!

---

## 🎯 Quick Reference: Section Timings

| Section | Start | Duration | Key Actions |
|---------|-------|----------|-------------|
| Intro | 0:00 | 15s | Show homepage, mention features |
| Problem/Goal | 0:15 | 10s | Show data.gov.in, back to homepage |
| Location Demo | 0:25 | 25s | IP button, dropdown, continue |
| Dashboard | 0:50 | 25s | 6 cards, pie chart, time range, line chart |
| Architecture | 1:15 | 15s | VS Code: dashboard, picker, API |
| Data Integration | 1:30 | 10s | VS Code: mgnrega.ts, sync, districts |
| Production | 1:40 | 15s | Health, logs, docs, scripts, GitHub |
| Close | 1:55 | 5s | Dashboard, thank you |

**Total Target:** 2:00 minutes (120 seconds)

---

## 💡 Pro Tips for Recording Day

### **If Something Goes Wrong:**
1. **Don't panic** - Pause for 3 seconds, then redo the last sentence
2. **Browser lag** - Pause silently, wait for it to load, continue
3. **Wrong click** - Say "Let me show that again" and redo
4. **Forgot what to say** - Pause, glance at script, continue naturally
5. **Audio glitch** - Stop recording, start over (better than bad audio)

### **Energy Management:**
- ☕ Have water nearby (not coffee - can make you jittery)
- 🧘 Take 3 deep breaths before starting
- 😊 Smile while talking (it improves your tone)
- 🎵 Vary your pitch and pace (monotone is boring)

### **Post-Recording:**
- ✅ Watch the full recording once before uploading
- ✅ Trim dead air at start and end
- ✅ Add chapter markers in Loom
- ✅ Set custom thumbnail (dashboard screenshot)
- ✅ Add call-to-action: "Links below 👇"

---

## 📊 Success Criteria

### **Must Have:**
- ✅ Under 2 minutes total duration
- ✅ Clear audio with no background noise
- ✅ Smooth transitions between browser and VS Code
- ✅ All key features demonstrated (IP detection, pie chart, time range, dashed lines)
- ✅ No long pauses or awkward silences

### **Nice to Have:**
- ⭐ Professional tone and pacing
- ⭐ Confident delivery without reading verbatim
- ⭐ Engaging enthusiasm about the project
- ⭐ Perfect timing hitting all checkpoints

---

## 🚀 You're Ready!

Follow this checklist step-by-step, and you'll have a professional, polished recording. Remember:
- **Practice makes perfect** - Do 1-2 dry runs
- **Don't aim for perfection** - Good enough is good enough
- **Have fun** - Your excitement about the project will show through!

Good luck! 🎬✨
