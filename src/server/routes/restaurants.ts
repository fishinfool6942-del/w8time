import { realtimeDb } from '../firebase';
import { SearchResult, RestaurantRecord } from '../types';

// GET /api/restaurants?lat=<latitude>&lng=<longitude>&distance=<miles>
// Returns restaurants within distance with current wait times
export const getRestaurantsNearby = async (req: Request) => {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lng = parseFloat(url.searchParams.get('lng') || '0');
  const distanceFilter = parseFloat(url.searchParams.get('distance') || '25');

  if (!lat || !lng) {
    return new Response(
      JSON.stringify({ error: 'Missing latitude and longitude' }),
      { status: 400 }
    );
  }

  try {
    // Fetch all restaurants from Firebase with current wait times
    const snapshot = await realtimeDb.ref('restaurants').get();
    const restaurants = snapshot.val() || {};

    // Convert to array and calculate distances
    const results: SearchResult[] = Object.entries(restaurants)
      .map(([id, data]: [string, any]) => {
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          lat,
          lng,
          data.latitude || 0,
          data.longitude || 0
        );

        // Determine if data is stale (no update in last 2 minutes)
        const isStale = Date.now() - data.lastUpdated > 120000;

        return {
          id,
          name: data.name || 'Unknown Restaurant',
          rating: data.rating || 0,
          ratingCount: data.ratingCount || 0,
          distance,
          currentWait: data.currentWait || 0,
          status: isStale ? 'STALE' : 'LIVE',
          lastUpdated: data.lastUpdated,
          photoUrl: data.photoUrl || '',
          address: data.address || '',
          cuisines: data.cuisines || [],
        };
      })
      .filter((r) => r.distance <= distanceFilter)
      .sort((a, b) => a.currentWait - b.currentWait); // Default: sort by wait time

    return new Response(JSON.stringify(results), { status: 200 });
  } catch (error) {
    console.error('Restaurants fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch restaurants' }),
      { status: 500 }
    );
  }
};

// Helper: Calculate distance between two coordinates (miles)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
