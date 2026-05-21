# Career Explorer

A full-stack web app for Wales School students to explore 44+ dream careers, learn step-by-step roadmaps, complete skill challenges, and earn cool roles.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/career-explorer run dev` — run the Vite frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth
- Optional env: `ADMIN_EMAIL` — defaults to `002159@walesschool.com`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, shadcn/ui, TanStack Query, Wouter, Framer Motion
- API: Express 5 + Clerk middleware
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (Google OAuth + email OTP)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (users, careers, career_steps, career_progress, challenges)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-zod/src/generated/` — Generated Zod schemas
- `lib/api-client-react/src/generated/` — Generated TanStack Query hooks
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/career-explorer/src/pages/` — Frontend pages

## Architecture decisions

- Contract-first API: OpenAPI spec → Zod validators + React Query hooks via Orval codegen
- Clerk auth proxy middleware on Express so Clerk SDK works on the same domain
- Admin check is `user.email === ADMIN_EMAIL` (no separate role column needed)
- Career steps and challenges are seeded at DB level — no CMS needed for MVP
- `@workspace/db` exports both the drizzle client and all schema tables for server use

## Product

- **Home page**: Landing page with live stats (total explorers, careers, challenges)
- **Auth**: Clerk sign-up/in with Google + email OTP, custom "Start Exploring!" branding
- **Onboarding**: New users enter display name and school grade
- **Explore**: Browse all 44 careers by category, search by keyword
- **Career Detail**: Step-by-step roadmap (3–8 steps per career), progress tracking
- **Challenges**: Quiz game — answer questions for your active career, get instant feedback
- **Profile**: View stats, active careers, role badges (Sigma Boy, Legend, etc.)
- **Admin panel**: `002159@walesschool.com` only — ban/unban users, set roles, view stats

## User preferences

- Made by Hamed for Wales School — copyright footer required on all pages
- Admin email: `002159@walesschool.com`
- Cool roles: Sigma Boy, 5B Sigma, Legend, Explorer, Pro

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes before touching frontend
- Run `pnpm --filter @workspace/db run push` after any schema changes in `lib/db/src/schema/`
- Clerk proxy middleware must be registered BEFORE `clerkMiddleware()` in Express app
- `tailwindcss({ optimize: false })` in vite.config.ts — required for Tailwind v4

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk configuration details
