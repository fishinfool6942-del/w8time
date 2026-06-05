export type Restaurant = {
  id: string;
  name: string;
  image: string;
  waitMinutes: number;
  lastUpdatedAt: number; // epoch ms
  rating: number;
  reviewCount: number;
  distanceMiles: number;
  address: string;
  phone: string;
  website?: string;
  menuUrl?: string;
  lat: number;
  lng: number;
};

const now = Date.now();

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "harvest-table",
    name: "The Harvest Table",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70",
    waitMinutes: 5,
    lastUpdatedAt: now - 30_000,
    rating: 4.7,
    reviewCount: 1284,
    distanceMiles: 0.8,
    address: "120 Main St",
    phone: "+15551112222",
    website: "https://example.com",
    menuUrl: "https://example.com/menu",
    lat: 0, lng: 0,
  },
  {
    id: "blue-fin",
    name: "Blue Fin Sushi",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=70",
    waitMinutes: 18,
    lastUpdatedAt: now - 45_000,
    rating: 4.5,
    reviewCount: 932,
    distanceMiles: 2.1,
    address: "45 Pine Ave",
    phone: "+15552223333",
    website: "https://example.com",
    lat: 0, lng: 0,
  },
  {
    id: "smoke-stack",
    name: "Smoke Stack BBQ",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=70",
    waitMinutes: 0,
    lastUpdatedAt: now - 20_000,
    rating: 4.6,
    reviewCount: 2103,
    distanceMiles: 3.7,
    address: "880 Oak Rd",
    phone: "+15553334444",
    menuUrl: "https://example.com/menu",
    lat: 0, lng: 0,
  },
  {
    id: "nonna-rosa",
    name: "Nonna Rosa Trattoria",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=70",
    waitMinutes: 35,
    lastUpdatedAt: now - 6 * 60_000,
    rating: 4.8,
    reviewCount: 1750,
    distanceMiles: 4.2,
    address: "12 Vine Ln",
    phone: "+15554445555",
    website: "https://example.com",
    menuUrl: "https://example.com/menu",
    lat: 0, lng: 0,
  },
  {
    id: "the-griddle",
    name: "The Griddle",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=70",
    waitMinutes: 12,
    lastUpdatedAt: now - 60_000,
    rating: 4.3,
    reviewCount: 612,
    distanceMiles: 12.5,
    address: "200 River Rd",
    phone: "+15555556666",
    lat: 0, lng: 0,
  },
  {
    id: "taco-libre",
    name: "Taco Libre",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=70",
    waitMinutes: 8,
    lastUpdatedAt: now - 25_000,
    rating: 4.4,
    reviewCount: 988,
    distanceMiles: 18.0,
    address: "77 Sunset Blvd",
    phone: "+15556667777",
    website: "https://example.com",
    lat: 0, lng: 0,
  },
  {
    id: "ember-steak",
    name: "Ember Steakhouse",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=70",
    waitMinutes: 45,
    lastUpdatedAt: now - 15 * 60_000,
    rating: 4.9,
    reviewCount: 3201,
    distanceMiles: 62.3,
    address: "500 Highland Way",
    phone: "+15557778888",
    website: "https://example.com",
    menuUrl: "https://example.com/menu",
    lat: 0, lng: 0,
  },
  {
    id: "coastal-crab",
    name: "Coastal Crab Shack",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=70",
    waitMinutes: 22,
    lastUpdatedAt: now - 40_000,
    rating: 4.5,
    reviewCount: 1455,
    distanceMiles: 88.7,
    address: "9 Harbor St",
    phone: "+15558889999",
    website: "https://example.com",
    lat: 0, lng: 0,
  },
];

export function getRestaurantById(id: string) {
  return MOCK_RESTAURANTS.find((r) => r.id === id);
}

export const FRESH_THRESHOLD_MS = 90_000;

export function isLive(lastUpdatedAt: number) {
  return Date.now() - lastUpdatedAt <= FRESH_THRESHOLD_MS;
}

export function formatLastUpdated(lastUpdatedAt: number) {
  const diff = Math.floor((Date.now() - lastUpdatedAt) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
