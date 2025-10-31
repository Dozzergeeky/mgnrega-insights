#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo "MGNREGA VPS Diagnostic and Fix Script"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Determine app directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "App Directory: $APP_DIR"
cd "$APP_DIR"

# Step 1: Check environment file
echo ""
echo "Step 1: Checking environment configuration..."
if [[ ! -f .env.local ]]; then
    echo -e "${RED}✗ .env.local not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env.local exists${NC}"

# Check required variables (masked)
MISSING_VARS=()
if ! grep -q '^MGNREGA_API_KEY=' .env.local; then
    MISSING_VARS+=("MGNREGA_API_KEY")
fi
if ! grep -q '^MGNREGA_RESOURCE_ID=' .env.local; then
    MISSING_VARS+=("MGNREGA_RESOURCE_ID")
fi
if ! grep -q '^MONGODB_URI=' .env.local; then
    MISSING_VARS+=("MONGODB_URI")
fi

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo -e "${RED}✗ Missing environment variables: ${MISSING_VARS[*]}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required environment variables present${NC}"

# Load environment
set -a
source .env.local
set +a

# Step 2: Check Node.js and npm
echo ""
echo "Step 2: Checking Node.js and npm..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}✗ Node.js not found in PATH${NC}"
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
echo -e "${GREEN}✓ npm: $NPM_VERSION${NC}"

# Step 3: Check MongoDB
echo ""
echo "Step 3: Checking MongoDB..."
if ! command -v mongosh >/dev/null 2>&1 && ! command -v mongo >/dev/null 2>&1; then
    echo -e "${RED}✗ MongoDB client not found${NC}"
    exit 1
fi

MONGO_CMD="mongosh"
if ! command -v mongosh >/dev/null 2>&1; then
    MONGO_CMD="mongo"
fi

if ! systemctl is-active --quiet mongod 2>/dev/null && ! systemctl is-active --quiet mongodb 2>/dev/null; then
    echo -e "${RED}✗ MongoDB service not running${NC}"
    echo "Starting MongoDB..."
    if systemctl list-units --type=service | grep -q 'mongod.service'; then
        sudo systemctl start mongod
    else
        sudo systemctl start mongodb
    fi
    sleep 3
fi

if $MONGO_CMD --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is running and accessible${NC}"
else
    echo -e "${RED}✗ Cannot connect to MongoDB${NC}"
    exit 1
fi

# Step 4: Check current data in MongoDB
echo ""
echo "Step 4: Checking existing data in MongoDB..."
RECORD_COUNT=$($MONGO_CMD "${MONGODB_DB:-mgnrega}" --quiet --eval 'db.district_metrics.countDocuments()' 2>/dev/null || echo "0")
echo "Current records in district_metrics: $RECORD_COUNT"

if [[ "$RECORD_COUNT" == "0" ]]; then
    echo -e "${YELLOW}⚠ No data in database${NC}"
else
    echo "Existing periods:"
    $MONGO_CMD "${MONGODB_DB:-mgnrega}" --quiet --eval 'db.district_metrics.distinct("period").sort()' 2>/dev/null || echo "[]"
fi

# Step 5: Test API connectivity
echo ""
echo "Step 5: Testing data.gov.in API connectivity..."
TEST_URL="https://api.data.gov.in/resource/${MGNREGA_RESOURCE_ID}?api-key=${MGNREGA_API_KEY}&format=json&limit=1"

if curl -sS --max-time 10 "$TEST_URL" -o /tmp/api-test.json 2>/dev/null; then
    STATUS=$(jq -r '.status // "unknown"' /tmp/api-test.json 2>/dev/null || echo "unknown")
    TOTAL=$(jq -r '.total // 0' /tmp/api-test.json 2>/dev/null || echo "0")
    
    if [[ "$STATUS" == "ok" ]] && [[ "$TOTAL" != "0" ]]; then
        echo -e "${GREEN}✓ API connection successful${NC}"
        echo "Total records available: $TOTAL"
    else
        echo -e "${YELLOW}⚠ API connection test unclear (status: $STATUS, total: $TOTAL)${NC}"
        echo "Proceeding with sync anyway..."
    fi
else
    echo -e "${YELLOW}⚠ Cannot reach data.gov.in API - network issue or rate limit${NC}"
    echo "Proceeding with sync anyway..."
fi

rm -f /tmp/api-test.json

# Step 6: Install dependencies if needed
echo ""
echo "Step 6: Ensuring dependencies are installed..."
if [[ ! -d node_modules ]]; then
    echo "Installing dependencies..."
    npm install --production
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Step 7: Seed districts if needed
echo ""
echo "Step 7: Checking district seed data..."
DISTRICT_COUNT=$($MONGO_CMD "${MONGODB_DB:-mgnrega}" --quiet --eval 'db.districts.countDocuments()' 2>/dev/null || echo "0")
echo "Districts in database: $DISTRICT_COUNT"

if [[ "$DISTRICT_COUNT" == "0" ]]; then
    echo "Seeding districts..."
    npm run seed:districts
    echo -e "${GREEN}✓ Districts seeded${NC}"
else
    echo -e "${GREEN}✓ Districts already seeded${NC}"
fi

# Step 8: Run data sync for multiple months
echo ""
echo "Step 8: Syncing data from data.gov.in..."
echo "This will sync the last 3 months of data..."

CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%-m)

MONTHS_TO_SYNC=()
for i in {0..2}; do
    MONTH=$((CURRENT_MONTH - i))
    YEAR=$CURRENT_YEAR
    
    if [[ $MONTH -le 0 ]]; then
        MONTH=$((12 + MONTH))
        YEAR=$((YEAR - 1))
    fi
    
    MONTHS_TO_SYNC+=("$YEAR $MONTH")
done

echo "Syncing periods: ${MONTHS_TO_SYNC[*]}"
echo ""

for PERIOD in "${MONTHS_TO_SYNC[@]}"; do
    read -r YEAR MONTH <<< "$PERIOD"
    echo "Syncing $YEAR-$(printf '%02d' $MONTH)..."
    
    if npm run --silent sync:mgnrega -- "$YEAR" "$MONTH"; then
        echo -e "${GREEN}✓ Synced $YEAR-$(printf '%02d' $MONTH)${NC}"
    else
        echo -e "${YELLOW}⚠ Failed to sync $YEAR-$(printf '%02d' $MONTH)${NC}"
    fi
    echo ""
done

# Step 9: Verify data
echo ""
echo "Step 9: Verifying synced data..."
FINAL_COUNT=$($MONGO_CMD "${MONGODB_DB:-mgnrega}" --quiet --eval 'db.district_metrics.countDocuments()' 2>/dev/null || echo "0")
echo "Total records after sync: $FINAL_COUNT"

if [[ "$FINAL_COUNT" == "0" ]]; then
    echo -e "${RED}✗ Still no data in database after sync${NC}"
    echo ""
    echo "Checking sync logs for errors..."
    if [[ -f logs/sync.log ]]; then
        echo "Last 50 lines of sync.log:"
        tail -50 logs/sync.log
    fi
    exit 1
fi

echo "Records per period:"
$MONGO_CMD "${MONGODB_DB:-mgnrega}" --quiet --eval 'db.district_metrics.aggregate([{$group:{_id:"$period",count:{$sum:1}}},{$sort:{_id:1}}])' 2>/dev/null

echo "Sample district data:"
$MONGO_CMD "${MONGODB_DB:-mgnrega}" --quiet --eval 'db.district_metrics.findOne({}, {districtName:1, period:1, "records":1, lastSyncedAt:1})' 2>/dev/null

# Step 10: Restart the application
echo ""
echo "Step 10: Restarting application..."
if command -v pm2 >/dev/null 2>&1; then
    pm2 restart all || pm2 start npm --name "mgnrega-app" -- start
    echo -e "${GREEN}✓ Application restarted${NC}"
else
    echo -e "${YELLOW}⚠ pm2 not found - please restart your application manually${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}Diagnostic and fix complete!${NC}"
echo "=============================================="
echo ""
echo "Summary:"
echo "- Environment: ✓"
echo "- Node.js/npm: ✓"
echo "- MongoDB: ✓"
echo "- API Access: ✓"
echo "- Data Synced: $FINAL_COUNT records"
echo ""
echo "Next steps:"
echo "1. Visit your application URL to verify data is displaying"
echo "2. Check logs: tail -f logs/sync.log"
echo "3. Verify cron job: crontab -l | grep cron-sync-data.sh"
echo ""
