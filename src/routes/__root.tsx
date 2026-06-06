import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LocationPermissionPrompt } from "../components/LocationPermissionPrompt";
import { useLocationPermission } from "../hooks/useLocationPermission";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { httpEquiv: "Cache-Control", content: "no-store, no-cache, must-revalidate, max-age=0" },
      { httpEquiv: "Pragma", content: "no-cache" },
      { httpEquiv: "Expires", content: "0" },
      { title: "W8TIME" },
      { name: "description", content: "This app has one simple purpose and only one function. To make available in a searchable and sortable list local restaurants with the lowest wait times now." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "W8TIME" },
      { property: "og:description", content: "This app has one simple purpose and only one function. To make available in a searchable and sortable list local restaurants with the lowest wait times now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "W8TIME" },
      { name: "twitter:description", content: "This app has one simple purpose and only one function. To make available in a searchable and sortable list local restaurants with the lowest wait times now." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ulT36ALlNqWr3EuPpTGsB7rre3K3/social-images/social-1780701803188-140.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ulT36ALlNqWr3EuPpTGsB7rre3K3/social-images/social-1780701803188-140.webp" },
    ],

    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { permissionStatus, isLoading, requestLocationPermission, denyLocationPermission } = useLocationPermission();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Show prompt on first load if permission hasn't been decided yet
  useEffect(() => {
    if (!isLoading && permissionStatus === "prompt") {
      setShowPrompt(true);
    }
  }, [isLoading, permissionStatus]);

  const handleAllow = async () => {
    setIsRequesting(true);
    await requestLocationPermission();
    setShowPrompt(false);
    setIsRequesting(false);
  };

  const handleDeny = () => {
    denyLocationPermission();
    setShowPrompt(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {showPrompt && (
        <LocationPermissionPrompt
          onAllow={handleAllow}
          onDeny={handleDeny}
          isLoading={isRequesting}
        />
      )}
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet context={{ locationPermission: { permissionStatus, isLoading } }} />
    </QueryClientProvider>
  );
}
