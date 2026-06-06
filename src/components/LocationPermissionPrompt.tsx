import { MapPin } from "lucide-react";

interface LocationPermissionPromptProps {
  onAllow: () => Promise<void>;
  onDeny: () => void;
  isLoading?: boolean;
}

export function LocationPermissionPrompt({
  onAllow,
  onDeny,
  isLoading = false,
}: LocationPermissionPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-sm w-full border border-border shadow-xl">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-foreground mb-2">
            Share Your Location?
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center mb-6">
            W8TIME would like to access your location to provide the most accurate restaurant search results near you.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDeny}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-semibold text-sm transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Not Now
            </button>
            <button
              onClick={onAllow}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Finding...
                </>
              ) : (
                "Allow"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
