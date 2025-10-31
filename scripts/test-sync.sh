#!/usr/bin/env bash
# Manual sync test - run this ON THE VPS to test data sync

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$APP_DIR"

# Load environment
if [[ -f .env.local ]]; then
    set -a
    source .env.local
    set +a
else
    echo "ERROR: .env.local not found"
    exit 1
fi

echo "Testing MGNREGA data sync..."
echo ""

# Check MongoDB
if ! mongosh --quiet --eval 'db.runCommand({ ping: 1 })' >/dev/null 2>&1; then
    echo "ERROR: Cannot connect to MongoDB"
    exit 1
fi

echo "MongoDB: ✓"

# Check API credentials
if [[ -z "${MGNREGA_API_KEY:-}" || -z "${MGNREGA_RESOURCE_ID:-}" ]]; then
    echo "ERROR: MGNREGA_API_KEY or MGNREGA_RESOURCE_ID not set"
    exit 1
fi

echo "API credentials: ✓"
echo ""

# Try to sync last 3 months
echo "Syncing last 3 months of data..."
echo ""

CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%-m)

for i in {0..2}; do
    MONTH=$((CURRENT_MONTH - i))
    YEAR=$CURRENT_YEAR
    
    if [[ $MONTH -le 0 ]]; then
        MONTH=$((12 + MONTH))
        YEAR=$((YEAR - 1))
    fi
    
    PERIOD="$YEAR-$(printf '%02d' $MONTH)"
    echo "==> Syncing $PERIOD"
    
    npm run --silent sync:mgnrega -- "$YEAR" "$MONTH" 2>&1 | tee -a logs/manual-sync.log
    
    echo ""
done

echo ""
echo "Checking database..."
mongosh "${MONGODB_DB:-mgnrega}" --quiet --eval '
    var count = db.district_metrics.countDocuments();
    print("Total records: " + count);
    print("");
    print("Records by period:");
    db.district_metrics.aggregate([
        {$group: {_id: "$period", count: {$sum: 1}, districts: {$addToSet: "$districtName"}}},
        {$sort: {_id: 1}},
        {$project: {period: "$_id", recordCount: "$count", districtCount: {$size: "$districts"}}}
    ]).forEach(function(doc) {
        print("  " + doc.period + ": " + doc.recordCount + " records across " + doc.districtCount + " districts");
    });
'

echo ""
echo "Done! If you see 0 records, check:"
echo "1. API key is valid: curl -sS \"https://api.data.gov.in/resource/\${MGNREGA_RESOURCE_ID}?api-key=\${MGNREGA_API_KEY}&format=json&limit=1\""
echo "2. Resource ID is correct for West Bengal MGNREGA data"
echo "3. Data exists for the requested periods"
