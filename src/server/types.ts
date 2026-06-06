// Device payload structure
export interface DevicePayload {
  id: string;           // Device/Restaurant ID (e.g., 'REST_001', 'DEV_001')
  wait: number;         // Current wait time in minutes (0-99)
  ts: number;           // Unix timestamp (seconds) when measurement was taken
}

// Internal restaurant record structure
export interface RestaurantRecord {
  restaurantId: string;
  deviceId: string;
  currentWait: number;
  lastUpdated: number;
  googlePlaceId?: string;        // From Google Places API
  name?: string;                  // Cached from Google Places
  rating?: number;                // Cached from Google Places
  address?: string;               // Cached from Google Places
  photoUrl?: string;              // Cached from Google Places
  placePhotoUrl?: string;         // Cached from Google Places
  cuisines?: string[];            // Cached from Google Places
  hours?: string;                 // Cached from Google Places
  lastGoogleSync?: number;        // Timestamp of last Google Places data fetch
}

// Search results structure (what app displays)
export interface SearchResult {
  id: string;
  name: string;
  rating: number;
  ratingCount: number;
  distance: number;              // in miles
  currentWait: number;           // in minutes
  status: 'LIVE' | 'STALE';
  lastUpdated: number;           // timestamp
  photoUrl: string;
  address: string;
  cuisines?: string[];
}
