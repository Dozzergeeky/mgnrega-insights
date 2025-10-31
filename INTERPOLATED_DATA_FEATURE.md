# Interpolated Data Marking Feature

## Overview
This feature visually distinguishes between real government data and interpolated (estimated) data in the historical trends chart, improving transparency and data trustworthiness.

## What Was Implemented

### 1. History API Updates (`src/app/api/history/route.ts`)
- Added `isInterpolated: boolean` field to each data point in the history response
- Real data from MongoDB is marked with `isInterpolated: false`
- Missing months are filled with estimates and marked with `isInterpolated: true`
- API response now includes:
  ```json
  {
    "history": [
      { "month": "May 2025", "workDemand": 120, "isInterpolated": false },
      { "month": "Jun 2025", "workDemand": 115, "isInterpolated": true }
    ],
    "source": "mixed_data",
    "realMonths": 4,
    "interpolatedMonths": 2
  }
  ```

### 2. TypeScript Interface Updates (`src/app/dashboard/page.tsx`)
- Updated `HistoricalData` interface to include optional `isInterpolated?: boolean` field

### 3. Chart Visualization Updates (`src/app/dashboard/page.tsx`)
The `MultiMetricTrendChart` component now:

#### Visual Indicators:
- **Solid lines** = Real government data
- **Dashed lines** = Interpolated/estimated data
- **Faded opacity (60%)** for interpolated lines
- **Amber-colored month labels** for interpolated data points

#### Data Quality Badge:
- Displays at the top of the chart when interpolated data exists
- Shows percentage of real data (e.g., "67% Real Data (2 months estimated)")
- Amber-colored badge with info icon

#### Enhanced Tooltip:
- Shows "Estimated Data" warning icon for interpolated points
- Displays all metric values with proper formatting
- Color-coded by metric type

#### Legend:
- Separate entries for real vs estimated data
- "(Real)" and "(Est)" suffixes on metric names

## Data Quality by Time Range

With current MongoDB data (May, Aug, Sept, Oct 2025):
- **3M view (Aug-Oct)**: 100% real data ✅
- **6M view (May-Oct)**: 67% real (4/6 months), 33% interpolated (Jun-Jul missing)
- **12M view (Nov24-Oct25)**: 33% real (4/12 months), 67% interpolated (8 months missing)

## Fetching More Historical Data

### Script Created: `scripts/sync-historical.ts`
A new script that:
- Attempts to fetch all available months from the government API
- Skips months already in MongoDB
- Reports which months have no data available from the API
- Includes progress tracking and detailed summary

### Usage:
```bash
# Sync last 12 months of historical data
npm run sync:historical 12

# Sync last 6 months
npm run sync:historical 6

# Sync last 3 months
npm run sync:historical 3
```

### Important Notes:
1. **Run on VPS**: The script is best run on the production VPS where MongoDB is running
2. **API Rate Limiting**: Script includes 2-second delays between requests
3. **Duration**: Syncing 12 months for 19 districts ≈ 228 API calls ≈ 8-10 minutes
4. **Environment Variables**: Requires `.env.local` with:
   - `MGNREGA_API_KEY`
   - `MGNREGA_RESOURCE_ID`
   - `MONGODB_URI`

### Running on VPS:
```bash
ssh root@172.105.36.247
cd /root/mgnrega-app

# Backup MongoDB first
./scripts/backup-mongodb.sh

# Run historical sync
npm run sync:historical 12

# Monitor progress
# The script shows detailed output for each district/month

# Restart PM2 after sync
pm2 restart mgnrega-app
```

## Expected Output After Full Sync

Once all available historical data is synced:
- Months with government data → Solid lines, marked as real
- Months without government data → Dashed lines, marked as interpolated
- Data quality badge shows accurate percentage of real vs estimated data

## Government API Data Availability

Based on testing, the data.gov.in API may have:
- **Limited historical coverage**: Not all months may be available
- **District variations**: Some districts may have more data than others
- **Seasonal patterns**: Monsoon months (Jun-Sep) may have different availability

The interpolation approach ensures users always see a complete time series while being transparent about data quality.

## Testing Interpolated Data Locally

Since MongoDB needs to be running and may not have all historical data locally:

1. **Start MongoDB**: `npm run db:up` (requires Docker)
2. **Sync current month**: `npm run sync:mgnrega 2025 10`
3. **View dashboard**: Open http://localhost:3000
4. **Select 6M or 12M range**: You'll see interpolated data for missing months with dashed lines

## Future Enhancements

Potential improvements:
1. **Cache API responses**: Store "no data available" results to avoid repeated API calls
2. **Interpolation quality score**: Show confidence level for estimates
3. **Data freshness indicator**: Show last sync timestamp per month
4. **Download data**: Export historical data with quality flags
5. **Admin panel**: Trigger syncs from web interface

## Files Modified

1. `src/app/api/history/route.ts` - Added `isInterpolated` field
2. `src/app/dashboard/page.tsx` - Enhanced chart with visual indicators
3. `scripts/sync-historical.ts` - New script for batch historical sync
4. `package.json` - Added `sync:historical` npm script

## Deployment

The feature is ready to deploy:
```bash
npm run build    # Build succeeded ✅
git add -A
git commit -m "feat: Add visual markers for interpolated data in historical charts"
git push origin main

# On VPS:
ssh root@172.105.36.247
cd /root/mgnrega-app
git pull origin main
npm install
npm run build
pm2 restart mgnrega-app
```
