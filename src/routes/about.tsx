import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — W8LIST" },
      { name: "description", content: "Learn about W8LIST and our mission to eliminate restaurant wait time guesswork." },
      { property: "og:title", content: "About Us — W8LIST" },
      { property: "og:description", content: "Learn about W8LIST and our mission to eliminate restaurant wait time guesswork." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </header>

      <main className="flex-1 px-6 pb-12 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-black tracking-tight">
          About <span className="text-primary">W8LIST</span>
        </h1>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            W8LIST was built on a simple belief: nobody should have to guess how long they'll be waiting for a table.
            We partner with restaurants to place a dedicated wait-time device at the host stand — updated in real time by the staff who know the floor best.
          </p>
          <p>
            For diners, that means accurate, live wait times before you ever leave the house. For restaurants, it means happier guests who show up informed and ready.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            What We Offer Restaurants
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>A free, battery-powered W8LIST device shipped directly to your location</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Increased visibility to hungry diners searching by wait time</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Simple plus / minus updates — no apps or training required</span>
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            What Diners Get
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Real-time wait times verified by staff, not algorithms</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Filter by distance, sort by wait, rating, or proximity</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>One-tap directions, calls, and website links for every listing</span>
            </li>
          </ul>
        </section>

        <section className="mt-10 p-4 rounded-xl border border-border bg-card">
          <h2 className="text-sm font-bold text-foreground">Our Promise</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We operate with the highest grade of service possible. Every wait time we display is either live and current, or clearly labeled with the moment it was last updated. Transparency, accuracy, and respect for your time are the foundation of everything we build.
          </p>
        </section>
      </main>
    </div>
  );
}
