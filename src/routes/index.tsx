import { createFileRoute, Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LocationRequiredPrompt } from "@/components/LocationRequiredPrompt";
import { useLocationPermission } from "@/hooks/useLocationPermission";

type Distance = 5 | 25 | 100;
type SortBy = "wait" | "rating" | "distance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "W8LIST — Real-time restaurant wait times" },
      { name: "description", content: "Find restaurants near you sorted by live wait time, rating, or distance." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { permissionStatus, requestLocationPermission } = useLocationPermission();
  const [distance, setDistance] = useState<Distance | null>(null);
  const [sortBy, setSortBy] = useState<SortBy | null>(null);
  const [showLocationRequired, setShowLocationRequired] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const ready = distance !== null && sortBy !== null;

  const distances: { label: string; value: Distance }[] = [
    { label: "5", value: 5 },
    { label: "25", value: 25 },
    { label: "100", value: 100 },
  ];
  const sorts: { label: string; value: SortBy }[] = [
    { label: "Wait Time", value: "wait" },
    { label: "Rating", value: "rating" },
    { label: "Distance", value: "distance" },
  ];

  const handleDistanceClick = (value: Distance) => {
    if (permissionStatus === "denied") {
      setShowLocationRequired(true);
    } else {
      setDistance(value);
    }
  };

  const handleEnableLocation = async () => {
    setIsRequesting(true);
    const success = await requestLocationPermission();
    setIsRequesting(false);
    
    if (success) {
      setShowLocationRequired(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showLocationRequired && (
        <LocationRequiredPrompt
          onClose={() => setShowLocationRequired(false)}
          onEnable={handleEnableLocation}
          isLoading={isRequesting}
        />
      )}

      <header className="pt-12 pb-8 px-6 text-center">
        <h1 className="text-5xl font-black tracking-tight">
          W<span className="text-primary">8</span>LIST
        </h1>
        <p className="mt-2 text-sm text-muted-foreground uppercase tracking-[0.2em]">
          Know before you Go.
        </p>
      </header>

      <main className="flex-1 px-6 pb-10 max-w-md mx-auto w-full">
        <section className="mt-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Distance (miles)
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {distances.map((d) => (
              <FilterButton
                key={d.value}
                active={distance === d.value}
                onClick={() => handleDistanceClick(d.value)}
                disabled={permissionStatus === "denied"}
                tooltip={permissionStatus === "denied" ? "Location access required" : undefined}
              >
                {d.label}
              </FilterButton>
            ))}
          </div>
          {permissionStatus === "denied" && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
              📍 Location access is required for distance-based search
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Sort By
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {sorts.map((s) => (
              <FilterButton
                key={s.value}
                active={sortBy === s.value}
                onClick={() => setSortBy(s.value)}
              >
                {s.label}
              </FilterButton>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <button
            disabled={!ready}
            onClick={() =>
              navigate({
                to: "/results",
                search: { distance: distance!, sort: sortBy! },
              })
            }
            className={cn(
              "w-full h-14 rounded-xl font-bold text-base transition-all",
              ready
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            Show Results
          </button>
          {!ready && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Select one option from each category to continue
            </p>
          )}
        </div>
      </main>

      <footer className="text-center pb-6">
        <div className="flex justify-center gap-6 text-xs text-muted-foreground/70">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact Us
          </Link>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground/60 tracking-widest uppercase">
          Powered by live restaurant devices
        </p>
      </footer>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
}

function FilterButton({
  active,
  onClick,
  children,
  disabled = false,
  tooltip,
}: FilterButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-14 rounded-xl border-2 font-semibold text-sm transition-all w-full",
          active
            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30"
            : disabled
              ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
              : "bg-card text-foreground border-border hover:border-primary/50 cursor-pointer",
        )}
      >
        {children}
      </button>
      {disabled && tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-muted text-muted-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
}
