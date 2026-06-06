import { realtimeDb } from '../firebase';
import { RestaurantRecord } from '../types';

// Cron job: Run weekly to refresh Google Places data for all restaurants
// Call this via a scheduled task (Cloud Scheduler, GitHub Actions, or external cron)
export const syncGooglePlacesData = async () => {
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  if (!GOOGLE_PLACES_API_KEY) {
    console.error('GOOGLE_PLACES_API_KEY not set');
    return { error: 'API key not configured' };
  }

  try {
    // Fetch all restaurants
    const snapshot = await realtimeDb.ref('restaurants').get();
    const restaurants = snapshot.val() || {};

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    // Process each restaurant
    for (const [restaurantId, data] of Object.entries(restaurants)) {
      const restaurant = data as RestaurantRecord;

      // Skip if recently synced (within 7 days)
      if (
        restaurant.lastGoogleSync &&
        Date.now() - restaurant.lastGoogleSync < CACHE_DURATION
      ) {
        skipped++;
        continue;
      }

      try {
        // Use restaurant name + address to search Google Places
        const searchQuery = `${restaurant.name} ${restaurant.address}`;
        const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
        searchUrl.searchParams.append('query', searchQuery);
        searchUrl.searchParams.append('key', GOOGLE_PLACES_API_KEY);

        const searchResponse = await fetch(searchUrl.toString());
        const searchData = await searchResponse.json();

        if (searchData.results && searchData.results.length > 0) {
          const place = searchData.results[0];
          const placeId = place.place_id;

          // Get detailed place information
          const detailUrl = new URL(
            'https://maps.googleapis.com/maps/api/place/details/json'
          );
          detailUrl.searchParams.append('place_id', placeId);
          detailUrl.searchParams.append(
            'fields',
            'name,rating,user_ratings_total,formatted_address,photos,types,opening_hours'
          );
          detailUrl.searchParams.append('key', GOOGLE_PLACES_API_KEY);

          const detailResponse = await fetch(detailUrl.toString());
          const detailData = await detailResponse.json();

          if (detailData.result) {
            const result = detailData.result;

            // Extract photo URL (first photo only to minimize data)
            let photoUrl = '';
            if (result.photos && result.photos.length > 0) {
              const photoRef = result.photos[0].photo_reference;
              photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`;
            }

            // Update restaurant record with Google data
            await realtimeDb.ref(`restaurants/${restaurantId}`).update({
              googlePlaceId: placeId,
              name: result.name,
              rating: result.rating || 0,
              ratingCount: result.user_ratings_total || 0,
              address: result.formatted_address,
              photoUrl,
              cuisines: (result.types || []).slice(0, 3), // First 3 types as cuisines
              hours: result.opening_hours?.weekday_text?.join('; ') || '',
              lastGoogleSync: Date.now(),
            });

            synced++;
          }
        }
      } catch (error) {
        console.error(`Error syncing restaurant ${restaurantId}:`, error);
        errors++;
      }

      // Rate limiting: 50 requests per second for Google Places
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      success: true,
      synced,
      skipped,
      errors,
      total: Object.keys(restaurants).length,
    };
  } catch (error) {
    console.error('Google Places sync error:', error);
    return { error: 'Failed to sync Google Places data' };
  }
};

// GET /api/sync-google-places
// Trigger manual sync (optional)
export const triggerGoogleSync = async (req: Request) => {
  // In production, validate this is called from authorized service
  const result = await syncGooglePlacesData();
  return new Response(JSON.stringify(result), { status: 200 });
};
