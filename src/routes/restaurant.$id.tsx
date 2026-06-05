import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { getRestaurantById, isLive, formatLastUpdated } from "@/lib/mock-restaurants";

export const Route = createFileRoute("/restaurant/$id")({
  loader: ({ params }) => {
    const restaurant = getRestaurantById(params.id);
    if (!restaurant) throw notFound();
    return { restaurant };
  },
  head: () => ({
    meta: [{ title: "Restaurant — W8LIST" }],
  }),
  component: RestaurantPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Restaurant not found.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Error: {error.message}
    </div>
  ),
});

function RestaurantPage() {
  const { restaurant: r } = Route.useLoaderData();
  const navigate = useNavigate();
  const live = isLive(r.lastUpdatedAt);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(
    r.address,
  )}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative">
        <img src={r.image} alt={r.name} className="w-full h-56 object-cover" />
        <button
          onClick={() => navigate({ to: "/" })}
          className="absolute top-4 left-4 bg-background/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center"
          aria-label="Back"
        >
          ←
        </button>
      </div>

      <main className="px-5 py-5 max-w-md mx-auto">
        <h1 className="text-2xl font-black">{r.name}</h1>
        <div className="text-sm text-muted-foreground mt-1">
          ★ {r.rating.toFixed(1)} ({r.reviewCount} reviews) · {r.distanceMiles} mi
        </div>

        <div className="mt-5 bg-card border border-border rounded-xl p-5 text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Current Wait</div>
          <div className="text-5xl font-black text-primary mt-1">
            {r.waitMinutes}
            <span className="text-base font-medium text-muted-foreground ml-2">min</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-center gap-1.5">
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

        <div className="mt-5 text-sm text-muted-foreground">{r.address}</div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {r.menuUrl && (
            <a
              href={r.menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center"
            >
              View Menu
            </a>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center"
          >
            Get Directions
          </a>
          {r.website && (
            <a
              href={r.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center"
            >
              Website
            </a>
          )}
          <a
            href={`tel:${r.phone}`}
            className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-semibold flex items-center justify-center"
          >
            Call {r.phone}
          </a>
        </div>
      </main>
    </div>
  );
}
