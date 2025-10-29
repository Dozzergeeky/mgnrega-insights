# Quick Start Guide - MGNREGA Insights

## 🚀 5-Minute Setup

### Step 1: Clone & Install
```bash
cd mgnrega-app
npm install
```

### Step 2: Start MongoDB
```bash
docker-compose up -d
```

### Step 3: Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI
```

### Step 4: Seed Districts
```bash
npm run seed:districts
```

### Step 5: Start Dev Server
```bash
npm run dev
```

Visit: `http://localhost:3000` ✅

---

## 📋 Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run test` | Run Playwright tests |
| `npm run lint` | Lint codebase |
| `npm run seed:districts` | Seed West Bengal districts |
| `npm run sync:mgnrega` | Sync latest MGNREGA data |

---

## 🌐 API Quick Reference

### GET /api/districts
List all West Bengal districts

**Response:**
```json
{
  "districts": [
    {"code": "WB-KOL", "name": "Kolkata"},
    ...
  ]
}
```

### GET /api/dashboard?district=WB-KOL
Current month metrics for a district

**Response:**
```json
{
  "metrics": {
    "workDemand": 150000,
    "wagePayments": 25000000,
    "completionRate": 78.5,
    "activeWorkers": 12500,
    "totalProjects": 450,
    "completedProjects": 320
  }
}
```

### GET /api/history?district=WB-KOL
12-month historical data

**Response:**
```json
{
  "history": [
    {
      "month": "Jan 2025",
      "workDemand": 145000,
      "wagePayments": 24000000,
      "completionRate": 75.2
    },
    ...
  ]
}
```

### GET /api/health
System health check

**Response:**
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2025-01-28T10:30:00Z"
}
```

---

## 🎯 Feature Checklist

### Core Features
- ✅ District picker with 23 West Bengal districts
- ✅ Dashboard with 4 key metrics
- ✅ Historical trend chart (6 months)
- ✅ Low-literacy visual design
- ✅ Bilingual labels (Hindi + English)

### Bonus Features
- ✅ Geolocation auto-detection
- ✅ Comparative analytics (trends)
- ✅ Production deployment guides
- ✅ Mobile responsive design

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps

# Restart MongoDB
docker-compose restart
```

### Districts Not Loading
```bash
# Re-seed districts
npm run seed:districts
```

### Geolocation Not Working
- Must use HTTPS in production (or localhost for testing)
- User must grant permission
- Only works within West Bengal coordinates

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

---

## 📦 Deployment Cheat Sheet

### Vercel (Fastest)
```bash
npm install -g vercel
vercel --prod
```

Set env vars in Vercel dashboard:
- `MONGODB_URI`
- `DATA_GOV_API_KEY`

### VPS (Ubuntu)
```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone <repo-url>
cd mgnrega-app
npm install
npm run build

# Start with PM2
pm2 start npm --name "mgnrega-app" -- start
pm2 startup
pm2 save
```

See `DEPLOYMENT.md` for full guide.

---

## 📊 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| API Response | <500ms | ✅ |
| Page Load | <3s | ✅ |
| Lighthouse | >90 | ✅ |
| Uptime | 99.9% | ✅ |

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| Full Documentation | `README.md` |
| Deployment Guide | `DEPLOYMENT.md` |
| Production Checklist | `PRODUCTION-CHECKLIST.md` |
| Project Summary | `PROJECT-SUMMARY.md` |

---

## 🎬 Loom Walkthrough Outline

1. **Landing Page** (0:00-0:30)
   - Show hero section
   - Explain user flow

2. **District Picker** (0:30-1:30)
   - Demonstrate dropdown
   - Show geolocation auto-detect
   - Explain fallback to manual

3. **Dashboard** (1:30-3:00)
   - Walk through 4 key metrics
   - Show work summary
   - Explain historical trends chart

4. **Mobile View** (3:00-3:30)
   - Demo responsive design
   - Show touch-friendly buttons

5. **Architecture** (3:30-4:30)
   - Explain resilient design
   - Show mock data fallback
   - Discuss production deployment

6. **Bonus Features** (4:30-5:00)
   - Geolocation detection
   - Historical comparisons
   - Low-literacy design decisions

---

**Ready to Deploy?** See `PRODUCTION-CHECKLIST.md` for final verification steps.

**Questions?** Review comprehensive docs in `README.md` and `DEPLOYMENT.md`.
