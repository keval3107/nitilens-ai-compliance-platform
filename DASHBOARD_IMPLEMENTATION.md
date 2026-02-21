# NitiLens Dashboard - Data-Driven Implementation

## Overview
The NitiLens compliance dashboard has been completely refactored to eliminate all hardcoded values and ensure all metrics are synchronized from a single source of truth.

## Key Changes

### Backend Changes

#### 1. Centralized API Endpoint (`/api/compliance/summary`)
Created a comprehensive endpoint that returns all dashboard metrics from actual scan results:

**Response Structure:**
```json
{
  "total_transactions": number,
  "total_scanned": number,
  "total_violations": number,
  "open_violations": number,
  "resolved_violations": number,
  "reviewed_violations": number,
  "false_positives": number,
  "compliance_rate": number | null,
  "active_rules": number,
  "severity_breakdown": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number
  },
  "most_violated_rules": [
    {
      "rule_id": string,
      "rule_name": string,
      "violation_count": number
    }
  ],
  "trend_data": [
    {
      "date": string,
      "violations": number,
      "compliance_rate": number
    }
  ],
  "last_scan_time": string | null,
  "dataset_connected": boolean,
  "dataset_laundering_rate": number
}
```

**Key Features:**
- `compliance_rate` returns `null` when no scans have been performed (instead of 0%)
- `severity_breakdown` only counts open violations
- `most_violated_rules` aggregates all violations by rule
- `trend_data` groups violations by detection date
- `dataset_connected` checks if the CSV file exists

#### 2. Activity Endpoint (`/api/compliance/activity`)
Returns real compliance activity events from violation records:

**Response Structure:**
```json
{
  "total": number,
  "items": [
    {
      "type": "violation_detected" | "violation_reviewed",
      "severity": "critical" | "high" | "medium" | "low",
      "transaction_id": string,
      "rule_name": string,
      "timestamp": string,
      "status": string,
      "comment": string (optional)
    }
  ]
}
```

### Frontend Changes

#### 1. Dashboard Component (`src/app/pages/Dashboard.tsx`)
Completely rewritten to be fully data-driven:

**Removed:**
- All hardcoded metric values
- Mock chart data imports
- Static activity items
- Hardcoded "6 active rules"

**Added:**
- Empty state handling for no dataset connected
- Empty state handling for no scans performed
- Dynamic compliance rate calculation with color coding
- Real-time activity feed from backend
- Refresh button to reload data
- Proper null handling for compliance_rate
- Dynamic chart data from API

**State Management:**
```typescript
const [data, setData] = useState<ComplianceSummary | null>(null);
const [activity, setActivity] = useState<ActivityResponse | null>(null);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
```

**Empty States:**
1. **No Dataset Connected**: Shows message to connect dataset
2. **No Scans Performed**: Shows message to run first scan
3. **No Violations**: Shows "All clear" message
4. **No Activity**: Shows "No recent compliance activity"

#### 2. ComplianceScan Component (`src/app/pages/ComplianceScan.tsx`)
Updated to fetch real data:

**Removed:**
- Hardcoded "51 records"
- Hardcoded "~20s" estimate
- Mock rule imports

**Added:**
- Dynamic transaction count from `api.getAMLStats()`
- Dynamic active rules count from `api.getComplianceSummary()`
- Calculated estimated time based on transaction count
- Error state handling
- Real violation data display

#### 3. API Service (`src/app/services/api.ts`)
Updated interfaces to match new backend structure:

**Updated:**
- `ComplianceSummary` interface with all new fields
- Added `ActivityItem` and `ActivityResponse` interfaces
- Added `getComplianceActivity()` method

## Compliance Rate Logic

### Backend Calculation
```python
if total_txns > 0:
    compliance_rate = round((1 - len(open_v) / total_txns) * 100, 2)
else:
    compliance_rate = None  # No data scanned yet
```

### Frontend Display
- `null`: Shows "No scans performed yet" message
- `>= 95%`: Green card with TrendingUp icon
- `>= 80%`: Yellow card with TrendingDown icon
- `< 80%`: Red card with TrendingDown icon

## Data Flow

### 1. Dashboard Load
```
User opens Dashboard
  ↓
Dashboard.tsx useEffect()
  ↓
api.getComplianceSummary() + api.getComplianceActivity()
  ↓
Backend loads violations.json + rules.json + dataset stats
  ↓
Backend calculates all metrics
  ↓
Frontend receives data and renders
```

### 2. Scan Trigger
```
User clicks "Run Compliance Scan"
  ↓
ComplianceScan.tsx handleStartScan()
  ↓
api.triggerScan() → POST /api/compliance/scan
  ↓
Backend runs violation_engine.run_scan()
  ↓
Backend saves violations to violations.json
  ↓
Frontend fetches api.listViolations('open')
  ↓
ComplianceScan shows results
  ↓
User navigates to Dashboard
  ↓
Dashboard fetches fresh data from /api/compliance/summary
```

## Validation Test Cases

### Case 1: No Dataset Connected
**Expected:**
- Dashboard shows "No Dataset Connected" card
- Button to navigate to data connection page
- No metrics displayed

**Verify:**
- `dataset_connected: false` in API response
- Empty state renders correctly

### Case 2: Dataset Connected, No Scans
**Expected:**
- Dashboard shows "No Scans Performed Yet" card
- Shows total transaction count
- Button to run compliance scan
- `compliance_rate: null`

**Verify:**
- API returns `compliance_rate: null`
- Frontend displays appropriate message
- No "0%" shown

### Case 3: Scans with No Violations
**Expected:**
- Compliance rate: 100%
- Open violations: 0
- Green card for compliance rate
- Green card for open violations showing "All clear"
- Severity pie chart shows "No Open Violations"

**Verify:**
- All metrics match
- No critical alert banner
- Charts show empty states

### Case 4: Scans with Violations
**Expected:**
- All metrics calculated from violations.json
- Compliance rate < 100%
- Open violations > 0
- Severity breakdown matches open violations
- Most violated rules chart populated
- Activity feed shows recent violations
- Critical alert banner if critical violations exist

**Verify:**
- Card metrics match API response
- Chart data matches API response
- Activity items match API response
- No discrepancies between components

## Synchronization Rules

1. **Single Source of Truth**: All metrics come from `/api/compliance/summary`
2. **No Hardcoded Values**: Every number is calculated from actual data
3. **Consistent Severity Counts**: Severity breakdown only counts open violations
4. **Real-Time Activity**: Activity feed pulls from violation timestamps
5. **Automatic Refresh**: Dashboard can be refreshed to get latest data
6. **Empty State Handling**: Every component handles empty data gracefully

## Files Modified

### Backend
- `backend/app/api/compliance.py` - Added summary and activity endpoints
- No changes to data models or storage

### Frontend
- `src/app/pages/Dashboard.tsx` - Complete rewrite
- `src/app/pages/ComplianceScan.tsx` - Removed hardcoded values
- `src/app/services/api.ts` - Updated interfaces and methods

## Testing Checklist

- [ ] Backend `/api/compliance/summary` returns correct data structure
- [ ] Backend `/api/compliance/activity` returns violation events
- [ ] Dashboard loads without errors
- [ ] Dashboard shows empty state when no dataset
- [ ] Dashboard shows empty state when no scans
- [ ] Dashboard shows correct metrics after scan
- [ ] Compliance rate calculation is correct
- [ ] Severity breakdown matches open violations
- [ ] Most violated rules chart is accurate
- [ ] Activity feed shows real events
- [ ] Refresh button updates data
- [ ] ComplianceScan shows real transaction count
- [ ] ComplianceScan shows real active rules count
- [ ] All charts handle empty data
- [ ] No console errors
- [ ] No hardcoded values remain

## Future Enhancements

1. **WebSocket Updates**: Real-time dashboard updates when scans complete
2. **Historical Trends**: Store scan history for longer-term trend analysis
3. **Drill-Down**: Click chart elements to filter violations
4. **Export**: Download compliance reports
5. **Alerts**: Email/Slack notifications for critical violations
6. **Scheduling**: Configure automatic scan schedules
7. **Comparison**: Compare compliance rates across time periods
