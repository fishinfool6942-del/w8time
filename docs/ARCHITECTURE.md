# W8TIME Backend Architecture

## System Overview

W8TIME is a real-time restaurant wait time discovery platform. Restaurants with our IoT devices transmit wait times to our cloud server every 60 seconds. The mobile app displays restaurants within a user's search radius with current wait times, ratings, and photos.

## Data Flow

### 1. Device -> Cloud Server (Every 60 seconds)
```
Restaurant Device
    ↓
  POST /api/device-data
    ↓
Firebase Realtime Database
```

**Payload (minimal, ~21 bytes):**
```json
{
  "id": "REST_001",
  "wait": 12,
  "ts": 1717651400
}
```

### 2. Google Places API Sync (Weekly)
```
Scheduled Job (7-day cycle)
    ↓
  Fetch all restaurants from Firebase
    ↓
  For each restaurant:
    - Search Google Places API
    - Get: name, rating, address, photos, hours
    - Cache in Firebase
    ↓
Firebase (with Google data cached)
```

**Cost:** ~$0.024 per restaurant per sync cycle = ~$4.80/month for 200 locations, ~$48/month for 2,000 locations

### 3. App Search -> Results (Real-time)
```
User enters location & distance
    ↓
  GET /api/restaurants?lat=29.76&lng=-95.37&distance=25
    ↓
Server:
  - Fetches all restaurants from Firebase
  - Calculates distance (Haversine formula)
  - Filters by distance radius
  - Determines LIVE/STALE status (2-min threshold)
  - Returns sorted by wait time
    ↓
App displays beautiful search results
```

## Database Schema (Firebase Realtime)

```
restaurants/
  REST_001/
    deviceId: "DEV_001"
    currentWait: 12
    lastUpdated: 1717651400
    latitude: 29.7589
    longitude: -95.3677
    name: "Smoke Stack BBQ"
    rating: 4.6
    ratingCount: 2103
    address: "123 Main St, Houston, TX"
    photoUrl: "https://maps.googleapis.com/maps/api/place/photo?..."
    cuisines: ["bbq", "restaurant", "food"]
    hours: "10am-10pm"
    lastGoogleSync: 1717607400
  REST_002/
    ... (same structure)
```

## Storage Calculations

### Initial Launch (200 restaurants)
- **Device transmissions:** 200 devices × 21 bytes × 1 message/min × 16 hours/day = 4.2 KB/day
- **Database footprint:** 200 restaurants × 500 bytes = 100 KB (stays constant, only "latest" record)
- **Monthly database cost:** FREE (Firebase free tier: 1 GB)
- **Monthly API cost:** ~$5 (Google Places weekly sync)

### Full Scale (2,000 restaurants)
- **Device transmissions:** 2,000 × 21 bytes × 1 message/min × 16 hours/day = 42 KB/day
- **Database footprint:** 2,000 × 500 bytes = 1 MB (stays constant)
- **Monthly database cost:** FREE (Firebase free tier)
- **Monthly API cost:** ~$50 (Google Places weekly sync)

## API Endpoints

### POST /api/device-data
Restaurant devices send wait time updates.

**Request:**
```json
{
  "id": "REST_001",
  "wait": 12,
  "ts": 1717651400
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wait time recorded",
  "restaurantId": "REST_001",
  "wait": 12,
  "timestamp": 1717651400
}
```

### GET /api/restaurants
App fetches restaurants within search radius.

**Query Parameters:**
- `lat` (required): User latitude
- `lng` (required): User longitude
- `distance` (optional, default 25): Search radius in miles

**Response:**
```json
[
  {
    "id": "REST_001",
    "name": "Smoke Stack BBQ",
    "rating": 4.6,
    "ratingCount": 2103,
    "distance": 3.7,
    "currentWait": 12,
    "status": "LIVE",
    "lastUpdated": 1717651400,
    "photoUrl": "https://maps.googleapis.com/...",
    "address": "123 Main St, Houston, TX",
    "cuisines": ["bbq", "restaurant"]
  }
]
```

### GET /api/sync-google-places
Manually trigger Google Places sync (normally runs on weekly schedule).

**Response:**
```json
{
  "success": true,
  "synced": 187,
  "skipped": 13,
  "errors": 0,
  "total": 200
}
```

## Key Features

✅ **Real-time wait times** - Updated every 60 seconds from devices  
✅ **Live status indicator** - Shows LIVE/STALE based on 2-minute threshold  
✅ **Beautiful restaurant cards** - Google Places photos, ratings, reviews  
✅ **Distance calculation** - Haversine formula for accurate miles  
✅ **Multiple sort options** - Wait time, rating, distance  
✅ **Anonymous user experience** - No login, no tracking, no ads  
✅ **Minimal data transmission** - Devices send only 21-byte messages  
✅ **Cost-effective scaling** - $50/month at 2,000 locations  

## Deployment & Scheduling

### Firebase Setup
1. Create Firebase project
2. Enable Realtime Database
3. Set security rules (allow device writes, allow app reads)
4. Download service account JSON

### Google Places Sync Scheduling
**Option 1: Firebase Cloud Functions** (recommended)
```typescript
exports.weeklyGoogleSync = functions.pubsub
  .schedule('every sunday 02:00')
  .onRun(async (context) => {
    return await syncGooglePlacesData();
  });
```

**Option 2: External cron service**
- GitHub Actions
- EasyCron.com
- AWS EventBridge

## Security Notes

- Device ID should be validated (whitelist of registered devices)
- API key rate limiting on device endpoint
- Google Places API key in environment variables only
- Firebase security rules restrict unauthorized writes

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Deploy backend to Node.js/Express or Firebase Functions
3. ✅ Integrate app with /api/restaurants endpoint
4. ✅ Set up Google Places sync job
5. ⏳ Device firmware: HTTP POST to /api/device-data every 60 seconds
6. ⏳ Restaurant onboarding: Assign device ID, configure location
