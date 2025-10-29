# MGNREGA Dashboard - Production Deployment Guide

## Architecture Overview

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui primitives
- **Deployment**: Vercel / VPS with PM2

### Backend
- **Database**: MongoDB (Atlas or self-hosted)
- **Caching**: In-memory cache + MongoDB TTL indexes
- **Data Sync**: Scheduled cron jobs (every 6 hours)

### Data Pipeline
1. **Ingestion**: `scripts/sync-mgnrega.ts` fetches from data.gov.in
2. **Storage**: MongoDB with TTL indexes for auto-cleanup
3. **Caching**: API responses cached for 1 hour
4. **Fallback**: Mock data when API unavailable

## Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=mgnrega
MONGODB_SERVER_SELECTION_TIMEOUT_MS=2000

# Optional
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Production Deployment

### Option 1: VPS (Recommended for this project)

```bash
# 1. Server Setup (Ubuntu 22.04)
sudo apt update
sudo apt install -y nodejs npm mongodb nginx certbot

# 2. Clone and Install
git clone <your-repo>
cd mgnrega-app
npm install
npm run build

# 3. Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 4. Seed Database
npm run db:up
npm run seed:districts

# 5. Start App with PM2
npm install -g pm2
pm2 start npm --name "mgnrega-app" -- start
pm2 save
pm2 startup

# 6. Setup Nginx Reverse Proxy
sudo nano /etc/nginx/sites-available/mgnrega
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-ip-or-domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mgnrega /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. Setup Cron for Data Sync (every 6 hours)
crontab -e
# Add: 0 */6 * * * cd /path/to/mgnrega-app && npm run sync:mgnrega
```

### Option 2: Vercel + MongoDB Atlas

```bash
# 1. Setup MongoDB Atlas (free tier)
# 2. Get connection string
# 3. Deploy to Vercel
vercel --prod

# 4. Set environment variables in Vercel dashboard
# 5. Setup Vercel Cron (vercel.json):
```

**vercel.json:**
```json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "0 */6 * * *"
  }]
}
```

## Key Production Features

### 1. **Resilient Data Fetching**
- Primary: data.gov.in API
- Fallback: Cached MongoDB data
- Ultimate fallback: Mock data

### 2. **Performance Optimization**
- Server-side rendering (SSR)
- API response caching
- MongoDB indexes on districtCode + recordDate
- Image optimization (Next.js built-in)

### 3. **Accessibility for Low-Literacy Users**
- Large, clear fonts
- Icon-based navigation
- Bilingual labels (English + Hindi)
- Simple color-coded metrics
- Location auto-detection
- No jargon - plain language explanations

### 4. **Scalability**
- Horizontal scaling via PM2 cluster mode
- Database connection pooling
- CDN for static assets
- Rate limiting on API routes

## Database Schema

```typescript
// districts collection
{
  code: "WB-KOL",
  name: "Kolkata",
  stateCode: "WB",
  stateName: "West Bengal"
}

// district_metrics collection
{
  districtCode: "WB-KOL",
  recordDate: ISODate("2025-10-01"),
  workDemand: 1250,
  wagePayments: 850000,
  completionRate: 68,
  activeWorkers: 890,
  totalProjects: 45,
  completedProjects: 28,
  createdAt: ISODate("2025-10-28"),
  updatedAt: ISODate("2025-10-28")
}
```

**Indexes:**
```javascript
db.districts.createIndex({ code: 1 }, { unique: true });
db.district_metrics.createIndex({ districtCode: 1, recordDate: -1 });
db.district_metrics.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year TTL
```

## Monitoring

```bash
# Application logs
pm2 logs mgnrega-app

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Testing

```bash
# Run tests
npm run test:e2e

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/districts
curl "http://localhost:3000/api/dashboard?district=WB-KOL"
```

## Security Checklist

- [ ] MongoDB authentication enabled
- [ ] Environment variables secured
- [ ] Rate limiting on API routes
- [ ] CORS configured
- [ ] HTTPS enabled (Let's Encrypt)
- [ ] Input validation on all endpoints
- [ ] MongoDB injection prevention (use parameterized queries)

## Cost Estimate (Monthly)

**Option 1: Self-hosted VPS**
- VPS (2GB RAM, 2 vCPU): $10-15/month
- Domain (optional): $12/year
- **Total: ~$15/month**

**Option 2: Serverless**
- Vercel (Hobby): Free
- MongoDB Atlas (M0): Free
- **Total: $0/month**

## Support

For issues, check:
1. Application logs: `pm2 logs`
2. MongoDB connectivity: `npm run db:up`
3. API health: `curl http://localhost:3000/api/health`
