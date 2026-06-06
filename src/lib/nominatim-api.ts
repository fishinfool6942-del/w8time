/**
 * Nominatim API integration for searching restaurants
 * Uses OpenStreetMap data - completely free, no API keys required
 */

export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  distanceMiles: number;
  rating?: number;
  reviewCount?: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Search for restaurants near a location using Nominatim
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @param radiusMiles - Search radius in miles
 * @returns Array of restaurants with accurate distances
 */
export async function searchRestaurants(
  userLat: number,
  userLon: number,
  radiusMiles: number
): Promise<Restaurant[]> {
  try {
    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `amenity=restaurant&` +
        `lat=${userLat}&` +
        `lon=${userLon}&` +
        `radius=${radiusMeters}&` +
        `limit=50&` +
        `accept-language=en`,
      {
        headers: {
          "User-Agent": "W8TIME-App",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json();

    if (!Array.isArray(results)) {
      return [];
    }

    // Transform Nominatim results to our Restaurant format
    const restaurants: Restaurant[] = results
      .map((place: any) => {
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const distance = calculateDistance(userLat, userLon, lat, lon);

        return {
          id: place.place_id.toString(),
          name: place.name || "Unknown Restaurant",
          lat,
          lon,
          address: place.address?.restaurant || place.display_name,
          distanceMiles: distance,
          // Nominatim doesn't provide ratings, but we can enhance this later
          rating: undefined,
          reviewCount: undefined,
        };
      })
      // Filter to only restaurants within the requested radius
      // (Nominatim's radius parameter isn't always exact)
      .filter((r) => r.distanceMiles <= radiusMiles);

    // Sort by distance by default
    return restaurants.sort((a, b) => a.distanceMiles - b.distanceMiles);
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return [];
  }
}

/**
 * Get details about a specific restaurant
 * @param placeId - The Nominatim place ID
 */
export async function getRestaurantDetails(placeId: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/details?` +
        `format=json&` +
        `osm_id=${placeId}&` +
        `accept-language=en`,
      {
        headers: {
          "User-Agent": "W8TIME-App",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting restaurant details:", error);
    return null;
  }
}