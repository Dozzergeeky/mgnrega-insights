# VPS Diagnostic and Fix Tools

Quick tools to diagnose and fix data sync issues on your VPS.

## Problem: Dashboard shows all zeros

This happens when:
1. MongoDB has no data
2. Sync script hasn't run or failed
3. API credentials are missing/incorrect
4. MongoDB service is down

## Quick Fix (Run Locally)

```bash
# Set your VPS details
export LINODE_HOST=172.105.36.247
export LINODE_USER=dozzer
export LINODE_APP_DIR=/home/dozzer/mgnrega-app

# Run the fix
./scripts/quick-vps-fix.sh
```

This will:
- ✓ Check environment variables
- ✓ Verify Node.js and npm
- ✓ Verify MongoDB is running
- ✓ Test API connectivity
- ✓ Sync last 3 months of data
- ✓ Restart the application

## Manual Fix (On VPS)

SSH into your VPS and run:

```bash
cd /home/dozzer/mgnrega-app

# Run full diagnostic
bash scripts/diagnose-and-fix.sh

# OR just test sync
bash scripts/test-sync.sh
```

## What Each Script Does

### `diagnose-and-fix.sh`
Complete diagnostic and automatic fix:
- Checks all environment variables
- Verifies services (Node, MongoDB)
- Tests API connectivity
- Seeds districts if missing
- Syncs 3 months of data
- Restarts application

### `quick-vps-fix.sh`
Local wrapper to run diagnostic remotely:
- Uploads diagnostic script
- Executes it via SSH
- Shows results in real-time

### `test-sync.sh`
Manual sync test (lighter):
- Quick MongoDB check
- Syncs last 3 months
- Shows database stats

## Common Issues

### Issue: "npm not found"
**Cause**: Node.js not installed or not in PATH for cron
**Fix**: The diagnostic script will install Node.js system-wide

### Issue: "Cannot connect to MongoDB"
**Cause**: MongoDB service not running
**Fix**: 
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Issue: "API returned error"
**Cause**: Invalid API key or resource ID
**Fix**: Check your `.env.local`:
```bash
grep MGNREGA .env.local
```

Test API manually:
```bash
curl -sS "https://api.data.gov.in/resource/${MGNREGA_RESOURCE_ID}?api-key=${MGNREGA_API_KEY}&format=json&limit=1"
```

### Issue: "Still no data after sync"
**Possible causes**:
1. **No data for current period** - Try syncing older months:
   ```bash
   npm run sync:mgnrega -- 2024 10
   npm run sync:mgnrega -- 2024 9
   ```

2. **Wrong resource ID** - Verify you're using the West Bengal MGNREGA dataset

3. **API rate limiting** - Wait a few minutes and try again

## Verification

After running the fix, verify data is present:

```bash
# Check MongoDB
mongosh mgnrega --quiet --eval 'db.district_metrics.countDocuments()'

# Should show > 0 records

# Check periods
mongosh mgnrega --quiet --eval 'db.district_metrics.distinct("period")'

# Should show ["2024-10", "2024-11", ...] or similar
```

## Logs

Check logs for errors:
```bash
# Sync logs
tail -100 logs/sync.log

# Application logs (if using pm2)
pm2 logs mgnrega-app

# System logs
sudo journalctl -u mongod -n 50
```

## Manual Sync

To manually sync specific months:
```bash
# Sync October 2024
npm run sync:mgnrega -- 2024 10

# Sync current month
npm run sync:mgnrega
```

## Cron Verification

Ensure daily sync is scheduled:
```bash
crontab -l | grep cron-sync-data.sh

# Should show:
# 0 2 * * * /bin/bash /home/dozzer/mgnrega-app/scripts/cron-sync-data.sh
```

## Emergency Reset

If everything fails, reset and resync:
```bash
cd /home/dozzer/mgnrega-app

# Drop and reseed
mongosh mgnrega --eval 'db.district_metrics.drop()'
npm run seed:districts

# Sync fresh data
bash scripts/test-sync.sh

# Restart app
pm2 restart all
```
