import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import agGridCss from "../styles/ag-grid.css?url";
import agGridScrollbarCss from "../styles/ag-grid-scrollbar-visibility.css?url";
import "@/lib/ag-grid-setup";
import { Button } from "@/components/ui/Button";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/features/auth/api/auth.api";
import type { AuthSession } from "@/features/auth/types";

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthSession | null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page doesn't exist.</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <Button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const auth = await getSession();
    return { auth };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GuestCare Live Copilot" },
      {
        name: "description",
        content:
          "Real-time support workspace for GuestCare agents — property intel, guided protocols, and one-click incident reports.",
      },
      { property: "og:title", content: "GuestCare Live Copilot" },
      {
        property: "og:description",
        content: "Real-time support workspace for GuestCare agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: agGridCss },
      { rel: "stylesheet", href: agGridScrollbarCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap",
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
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
