import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState, useEffect } from "react";
import { searchRestaurants, Restaurant } from "@/lib/nominatim-api";
import { useLocationStore } from "@/hooks/useLocationStore";

const searchSchema = z.object({
  distance: fallback(z.union([z.literal(5), z.literal(25), z.literal(100)]), 25).default(25),
  sort: fallback(z.enum(["wait", "rating", "distance"]), "distance").default("distance"),
});

export const Route = createFileRoute("/results")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [{ title: "Results — W8LIST" }],
  }),
  component: Results,
});

function Results() {
  const { distance, sort } = Route.useSearch();
  const navigate = useNavigate();
  const { userLocation } = useLocationStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!userLocation) {
        setError("Unable to get your location");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await searchRestaurants(
          userLocation.lat,
          userLocation.lon,
          distance
        );
        setRestaurants(results);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [userLocation, distance]);

  // Sort restaurants based on user selection
  const sorted = [...restaurants].sort((a, b) => {
    if (sort === "distance") {
      return a.distanceMiles - b.distanceMiles;
    } else if (sort === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    }
    // Default to distance
    return a.distanceMiles - b.distanceMiles;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold">
            Within {distance} mi · {sort === "distance" ? "Distance" : sort === "rating" ? "Rating" : "Distance"}
          </h1>
        </div>
        <div className="w-12" />
      </header>

      <main className="px-4 py-4 max-w-md mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-muted-foreground">Finding restaurants near you...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="text-primary hover:text-primary/80 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-center text-muted-foreground mt-12">
            No restaurants found within {distance} miles.
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((restaurant) => (
              <li key={restaurant.id}>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition">
                  <div className="flex items-start gap-3">
                    {/* Placeholder for restaurant image */}
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold truncate text-base">{restaurant.name}</h2>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {restaurant.rating && (
                          <>★ {restaurant.rating.toFixed(1)}{restaurant.reviewCount && ` (${restaurant.reviewCount})`} · </>
                        )}
                        {restaurant.distanceMiles.toFixed(1)} mi
                      </div>
                      {restaurant.address && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {restaurant.address}
                        </p>
                      )}
                      <div className="mt-3 inline-block">
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}/@${restaurant.lat},${restaurant.lon},15z`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          📍 View on Google Maps →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {sorted.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Found {sorted.length} restaurant{sorted.length !== 1 ? "s" : ""} within {distance} miles
          </p>
        )}
      </main>
    </div>
  );
}