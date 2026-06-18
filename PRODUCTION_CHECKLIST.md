# PromptOS — Production Deployment Checklist

## 1. Supabase Setup (Database + Auth)

- [ ] Create a Supabase project at https://supabase.com
- [ ] Go to SQL Editor → run `supabase/migrations/00001_initial_schema.sql`
- [ ] Go to **Authentication → Settings** → enable Email + Google + GitHub providers
- [ ] Go to **Project Settings → API** → copy `Project URL` and `anon public key`
- [ ] Add them to `.env`:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

## 2. Authentication Flow

### Email Auth

- Already configured in `src/hooks/use-auth.tsx`
- After signup, users receive a confirmation email by default

### Google + GitHub OAuth

- In Supabase Dashboard → Authentication → Providers → Enable Google & GitHub
- Set callback URL to: `https://your-domain.com/auth/callback`
- Create the callback route at `src/routes/auth/callback.tsx`:

  ```tsx
  import { createFileRoute, useNavigate } from "@tanstack/react-router";
  import { useEffect } from "react";
  import { supabase } from "@/lib/supabase";

  export const Route = createFileRoute("/auth/callback")({
    component: AuthCallback,
  });

  function AuthCallback() {
    const navigate = useNavigate();
    useEffect(() => {
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN") navigate({ to: "/dashboard" });
      });
    }, []);
    return <div>Authenticating...</div>;
  }
  ```

## 3. OpenRouter API (for Prompt Optimizer & Testing Lab)

- Sign up at https://openrouter.ai
- Get API key → add to `.env`:
  ```
  VITE_OPENROUTER_API_KEY=sk-or-v1-xxxx
  ```
- Create API routes in `src/routes/api/` for server-side model calls

## 4. Stripe Payments (for Marketplace)

- Sign up at https://stripe.com
- Add keys to `.env`:
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
  STRIPE_SECRET_KEY=sk_test_xxxx
  ```
- Create webhook endpoint for handling payments
- Add Stripe Checkout integration in prompt purchase flow

## 5. Missing Backend (API Routes)

This project currently uses **hardcoded demo data**. You need to build:

| Route                               | Purpose                                      |
| ----------------------------------- | -------------------------------------------- |
| `GET /api/prompts`                  | List prompts with filters, pagination        |
| `GET /api/prompts/:id`              | Single prompt details                        |
| `POST /api/prompts`                 | Create prompt (creator dashboard)            |
| `PUT /api/prompts/:id`              | Update prompt                                |
| `DELETE /api/prompts/:id`           | Delete prompt                                |
| `POST /api/prompts/:id/like`        | Toggle like                                  |
| `POST /api/prompts/:id/save`        | Toggle save                                  |
| `GET /api/collections`              | List user collections                        |
| `POST /api/collections`             | Create collection                            |
| `POST /api/collections/:id/prompts` | Add prompt to collection                     |
| `GET /api/users/:id`                | User profile                                 |
| `POST /api/users/:id/follow`        | Toggle follow                                |
| `GET /api/battles`                  | List battles                                 |
| `POST /api/battles/:id/vote`        | Cast vote                                    |
| `GET /api/discussions`              | Community discussions                        |
| `POST /api/discussions`             | Create discussion                            |
| `GET /api/admin/stats`              | Admin dashboard stats                        |
| `POST /api/optimizer`               | Optimize prompt (calls OpenRouter)           |
| `POST /api/lab/test`                | Test prompt across models (calls OpenRouter) |

TanStack Start supports API routes at `src/routes/api/`. Example:

```ts
// src/routes/api/prompts.ts
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/prompts")({
  GET: async ({ request }) => {
    // fetch from Supabase
    return Response.json({ prompts: [] });
  },
});
```

## 6. Image Uploads

- Set up **Supabase Storage** bucket `prompt-images`
- Create upload endpoint
- Update prompt creation form with image upload

## 7. SEO & Metadata

- [ ] Each page already has `<head>` meta tags — verify them
- [ ] Add sitemap generation script
- [ ] Add `robots.txt`
- [ ] Set up Open Graph images

## 8. Deployment

### Option A: Vercel (Recommended)

```
npm i -g vercel
vercel
```

- Set all `.env` variables in Vercel dashboard
- Connect Supabase project

### Option B: Cloudflare Pages

- Build command: `npm run build`
- Output dir: `dist/client`
- Set env vars in Cloudflare dashboard

### Option C: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "run", "start"]
```

## 9. Final Polish Checklist

- [ ] Replace all hardcoded demo data with Supabase queries
- [ ] Add loading skeletons for all pages
- [ ] Add error boundaries for API failures
- [ ] Implement real search (Supabase full-text search or Algolia)
- [ ] Add pagination to all list views
- [ ] Set up rate limiting on API routes
- [ ] Add analytics (PostHog or Plausible)
- [ ] Add email notifications (Resend or SendGrid)
- [ ] Set up monitoring (Sentry)
- [ ] Write unit tests for critical flows
- [ ] Accessibility audit

---

## Quick Start (already works in demo mode without any .env)

```bash
npm install
npm run dev
```

Visiting `http://localhost:8080` will show the full UI with mock data.
Just add Supabase + API routes + OpenRouter to make it fully functional.
