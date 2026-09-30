import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell } from "../../../../shared/ui";
import sharedCss from "../../../../shared/styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MetricFlow" },
      { name: "description", content: "The calm workspace for growing teams." },
      { property: "og:title", content: "MetricFlow" },
      { property: "og:description", content: "The calm workspace for growing teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: sharedCss }],
  }),
  shellComponent: RootShell,
  component: RootLayout,
  notFoundComponent: () => <AppShell brand="MetricFlow" eyebrow="RustaBase template" theme="saas"><div className="empty"><h1>Page not found</h1><a href="/">Return home</a></div></AppShell>,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function RootLayout() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><Outlet /></QueryClientProvider>;
}
