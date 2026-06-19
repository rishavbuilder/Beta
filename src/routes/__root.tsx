import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../hooks/use-auth";
import { AdBanner } from "../components/AdBanner";

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
      { title: "PromptOS — The precision layer for creative intelligence" },
      {
        name: "description",
        content:
          "Discover, version, and deploy precision prompts for ChatGPT, Claude, Midjourney and every major AI model. Managed in one studio.",
      },
      { name: "author", content: "PromptOS Labs" },
      { name: "keywords", content: "AI prompts, prompt marketplace, ChatGPT prompts, Claude prompts, Midjourney prompts, prompt engineering" },
      { name: "google-site-verification", content: "A9Ye34bltIbO6O7UZG2Kfep--0rHzD5JlJVQy65uYPE" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "PromptOS — Engineer the perfect response" },
      {
        property: "og:description",
        content:
          "The marketplace and workbench for AI prompt engineers. Discover trending prompts, test across models, and ship with confidence.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://rishavbuilder-beta.vercel.app" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@promptos" },
      { name: "theme-color", content: "#09090b" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: "https://rishavbuilder-beta.vercel.app" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
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
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.classList.remove("dark")})();`,
          }}
        />
        <script defer src="/_vercel/speed-insights/script.js" data-route="/" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "PromptOS",
            "url": "https://rishavbuilder-beta.vercel.app",
            "description": "Discover, version, and deploy precision prompts for ChatGPT, Claude, Midjourney and every major AI model.",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "All",
            "author": {
              "@type": "Organization",
              "name": "PromptOS Labs"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }} />
      </head>
      <body>
        {children}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker" in navigator)navigator.serviceWorker.getRegistrations().then(function(r){for(var t of r)t.unregister()});`,
          }}
        />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const script = document.querySelector('script[src*="speed-insights"]');
    if (script) script.setAttribute("data-route", router.state.location.pathname);
  }, [router.state.location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <AdBanner />
      </AuthProvider>
    </QueryClientProvider>
  );
}
