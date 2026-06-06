/**
 * OpenStreetMap restaurant search
 * Uses the Overpass API for radius-based "amenities near a point" queries
 * (Nominatim's /search endpoint is a geocoder and does not support radius search).
 * Completely free, no API keys required.
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
  phone?: string;
  website?: string;
  cuisine?: string;
}

/**
 * Haversine distance in miles between two coordinates.
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildAddress(tags: Record<string, string> = {}): string | undefined {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/**
 * Search for real restaurants near a location using the Overpass API.
 */
export async function searchRestaurants(
  userLat: number,
  userLon: number,
  radiusMiles: number
): Promise<Restaurant[]> {
  const radiusMeters = Math.round(radiusMiles * 1609.34);

  // Query restaurants, cafes, fast food, bars, pubs as "places to eat"
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court)$"](around:${radiusMeters},${userLat},${userLon});
      way["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court)$"](around:${radiusMeters},${userLat},${userLon});
    );
    out center tags;
  `.trim();

  let data: any = null;
  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });
      if (!response.ok) {
        lastError = new Error(`Overpass error: ${response.status}`);
        continue;
      }
      data = await response.json();
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!data) {
    console.error("Error searching restaurants:", lastError);
    return [];
  }

  const elements: any[] = Array.isArray(data.elements) ? data.elements : [];

  const restaurants: Restaurant[] = elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (typeof lat !== "number" || typeof lon !== "number") return null;
      const tags = el.tags ?? {};
      if (!tags.name) return null; // skip unnamed POIs

      return {
        id: `${el.type}/${el.id}`,
        name: tags.name as string,
        lat,
        lon,
        address: buildAddress(tags),
        distanceMiles: calculateDistance(userLat, userLon, lat, lon),
        rating: undefined,
        reviewCount: undefined,
        phone: tags.phone || tags["contact:phone"],
        website: tags.website || tags["contact:website"],
        cuisine: tags.cuisine,
      } as Restaurant;
    })
    .filter((r): r is Restaurant => r !== null && r.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  return restaurants;
}
