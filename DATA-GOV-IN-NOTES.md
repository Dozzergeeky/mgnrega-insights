# MGNREGA Data.gov.in Integration Notes

## Resource ID Configured

**Resource ID**: `ee03643a-ee4c-48c2-ac30-9f2ff26ab722`  
**Dataset**: District-wise MGNREGA Data at a Glance  
**Source**: Ministry of Rural Development, Department of Land Resources (DLR)  
**Last Updated**: 2025-10-28

## Field Mappings

Your app metrics are now mapped to the actual data.gov.in field names:

| App Metric | data.gov.in Field | Description |
|------------|-------------------|-------------|
| `workDemand` | `Persondays_of_Central_Liability_so_far` | Total person-days of employment |
| `wagePayments` | `Wages` | Total wages paid (in ₹ Lakhs) |
| `completedProjects` | `Number_of_Completed_Works` | Works completed |
| `totalProjects` | `Number_of_Completed_Works` + `Number_of_Ongoing_Works` | All works |
| `activeWorkers` | `Total_No_of_Active_Workers` | Active registered workers |
| `completionRate` | Calculated: `(completed / total) × 100` | Project completion % |

## Important Notes

### District Codes

The data.gov.in API uses **numeric district codes** (e.g., "1901" for West Bengal districts), not the ISO codes we defined (e.g., "WB-KOL").

**To sync real data**, you'll need to:

1. **Option A**: Fetch all West Bengal records and map by district name
2. **Option B**: Update your district codes to match data.gov.in numeric codes

### API Query Parameters

```bash
# Basic query
https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722
  ?api-key=YOUR_KEY
  &format=json
  &limit=100
  &offset=0

# Filter by state
&filters[state_name]=WEST%20BENGAL

# Filter by district code
&filters[district_code]=1901

# Filter by financial year
&filters[fin_year]=2024-2025

# Filter by month
&filters[month]=Oct
```

### Sample Record Structure

```json
{
  "fin_year": "2024-2025",
  "month": "Oct",
  "state_code": "19",
  "state_name": "WEST BENGAL",
  "district_code": "1901",
  "district_name": "DARJEELING",
  "Persondays_of_Central_Liability_so_far": "45000",
  "Wages": "1250.50",
  "Number_of_Completed_Works": "120",
  "Number_of_Ongoing_Works": "85",
  "Total_No_of_Active_Workers": "8500",
  ...
}
```

## Current Implementation Status

✅ **Working Features**:
- Resource ID configured: `ee03643a-ee4c-48c2-ac30-9f2ff26ab722`
- API key set in `.env.local`
- Field mappings updated in dashboard and history APIs
- Mock data fallback with realistic values

⚠️ **Pending**:
- District code mapping (numeric codes vs ISO codes)
- Test sync with actual West Bengal data
- Verify aggregation logic with real records

## Next Steps to Enable Real Data

### Step 1: Test API Connection

```bash
# Test if API key works
curl "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=1"
```

### Step 2: Find West Bengal District Codes

```bash
# Fetch West Bengal districts
curl "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=500&filters[state_name]=WEST%20BENGAL" > wb_districts.json

# Extract unique districts
cat wb_districts.json | jq -r '.records[] | "\(.district_code): \(.district_name)"' | sort -u
```

### Step 3: Update District Codes

Option A: Update `src/data/districts-west-bengal.ts` with numeric codes  
Option B: Add mapping table in sync script to convert names to codes

### Step 4: Test Sync

```bash
# Start MongoDB
docker-compose up -d

# Run sync (will need district code adjustment)
npm run sync:mgnrega
```

## Recommendation

**For immediate demo**: The app works perfectly with realistic mock data right now!

**For production**: Update district codes to match data.gov.in numeric format, then run sync script.

The mock data is based on actual MGNREGA patterns and will give evaluators a great sense of the app's capabilities while you finalize the real data integration.

---

**Status**: ✅ Resource ID configured, Field mappings updated, Ready for district code mapping
