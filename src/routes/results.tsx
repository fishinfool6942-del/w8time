import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import {
  MOCK_RESTAURANTS,
  isLive,
  formatLastUpdated,
} from "@/lib/mock-restaurants";

const searchSchema = z.object({
  distance: fallback(z.union([z.literal(5), z.literal(25), z.literal(100)]), 25).default(25),
  sort: fallback(z.enum(["wait", "rating", "distance"]), "wait").default("wait"),
});

export const Route = createFileRoute("/results")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [{ title: "Results — W8TIME" }],
  }),
  component: Results,
});

function Results() {
  const { distance, sort } = Route.useSearch();
  const navigate = useNavigate();

  const filtered = MOCK_RESTAURANTS.filter((r) => r.distanceMiles <= distance);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "wait") return a.waitMinutes - b.waitMinutes;
    if (sort === "rating") return b.rating - a.rating;
    return a.distanceMiles - b.distanceMiles;
  });

  const sortLabel =
    sort === "wait" ? "Wait Time" : sort === "rating" ? "Rating" : "Distance";

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
            Within {distance} mi · {sortLabel}
          </h1>
        </div>
        <div className="w-12" />
      </header>

      <main className="px-4 py-4 max-w-md mx-auto">
        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground mt-12">
            No restaurants found within {distance} miles.
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((r) => {
              const live = isLive(r.lastUpdatedAt);
              return (
                <li key={r.id}>
                  <Link
                    to="/restaurant/$id"
                    params={{ id: r.id }}
                    className="block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/60 transition"
                  >
                    <div className="flex gap-3">
                      <img
                        src={r.image}
                        alt={r.name}
                        loading="lazy"
                        className="w-24 h-24 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 py-2 pr-3">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="font-bold truncate text-base">
                            {r.name}
                          </h2>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span
                              className={`text-lg font-bold leading-none ${
                                r.waitMinutes === 0
                                  ? "text-green-500"
                                  : r.waitMinutes <= 15
                                  ? "text-foreground"
                                  : "text-amber-500"
                              }`}
                            >
                              {r.waitMinutes === 0 ? "No wait" : `${r.waitMinutes}m`}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              wait
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          ★ {r.rating.toFixed(1)} ({r.reviewCount.toLocaleString()}) ·{" "}
                          {r.distanceMiles.toFixed(1)} mi
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${
                              live ? "text-green-500" : "text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                live ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                              }`}
                            />
                            {live ? "Live" : "Stale"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            · updated {formatLastUpdated(r.lastUpdatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {sorted.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            {sorted.length} restaurant{sorted.length !== 1 ? "s" : ""} within {distance} miles
          </p>
        )}
      </main>
    </div>
  );
}
