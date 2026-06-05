import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { MOCK_RESTAURANTS, isLive, formatLastUpdated } from "@/lib/mock-restaurants";

const searchSchema = z.object({
  distance: fallback(z.union([z.literal(5), z.literal(25), z.literal(100)]), 25).default(25),
  sort: fallback(z.enum(["wait", "rating", "distance"]), "wait").default("wait"),
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

  const filtered = MOCK_RESTAURANTS
    .filter((r) => r.distanceMiles <= distance)
    .sort((a, b) => {
      if (sort === "wait") return a.waitMinutes - b.waitMinutes;
      if (sort === "rating") return b.rating - a.rating;
      return a.distanceMiles - b.distanceMiles;
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold">
            Within {distance} mi · {sort === "wait" ? "Wait" : sort === "rating" ? "Rating" : "Distance"}
          </h1>
        </div>
        <div className="w-12" />
      </header>

      <main className="px-4 py-4 max-w-md mx-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground mt-12">
            No restaurants within {distance} miles.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((r) => {
              const live = isLive(r.lastUpdatedAt);
              return (
                <li key={r.id}>
                  <Link
                    to="/restaurant/$id"
                    params={{ id: r.id }}
                    className="block bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={r.image}
                        alt={r.name}
                        className="w-20 h-20 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold truncate">{r.name}</h2>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          ★ {r.rating.toFixed(1)} ({r.reviewCount}) · {r.distanceMiles} mi
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-2xl font-black text-primary">
                            {r.waitMinutes}
                            <span className="text-xs font-medium text-muted-foreground ml-1">min wait</span>
                          </span>
                        </div>
                        <div className="mt-1 text-xs flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              live ? "bg-green-500" : "bg-muted-foreground"
                            }`}
                          />
                          <span className="text-muted-foreground">
                            {live ? "Live" : "Stale"} · updated {formatLastUpdated(r.lastUpdatedAt)}
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
      </main>
    </div>
  );
}
