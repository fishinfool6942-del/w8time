import { AlertCircle } from "lucide-react";

interface LocationRequiredPromptProps {
  onClose: () => void;
  onEnable: () => Promise<void>;
  isLoading?: boolean;
}

export function LocationRequiredPrompt({
  onClose,
  onEnable,
  isLoading = false,
}: LocationRequiredPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-sm w-full border border-border shadow-xl">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-500/10 p-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-foreground mb-2">
            Location Required
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center mb-6">
            Distance-based search requires location access. Enable it in your device settings or allow W8TIME to access your location now.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-semibold text-sm transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onEnable}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Finding...
                </>
              ) : (
                "Enable Location"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
