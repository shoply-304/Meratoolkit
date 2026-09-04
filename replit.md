# CreatorFlow AI

CreatorFlow AI is an AI-powered content creation toolkit that helps creators turn one topic into ideas, titles, hooks, descriptions, outlines, thumbnail concepts, hashtags, and calendars.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/creatorflow-ai/src/` — responsive React app, routes, workspace UI, local history, and theme tokens
- `artifacts/api-server/src/routes/generation.ts` — server-side Gemini generation endpoint and validation
- `lib/api-spec/openapi.yaml` — source of truth for the generation contract
- `lib/api-client-react/src/generated/` — generated React Query client and types

## Architecture decisions

- Generated content is requested only from the server; the browser never receives the Gemini key.
- History, saved generations, and preferences use local storage while authentication/database are not configured.
- The generation response is structured so each tool can render cards, sections, or calendar rows without fake placeholder data.
- Pricing is informational until a real payment provider is connected.

## Product

The app includes a public landing experience, a responsive creator workspace, eight AI tools, templates, local history, pricing, settings, and supporting public pages. Real Gemini generation powers the tool flows through the API server.

## User preferences

The product should feel like a polished, professional SaaS product for creators, not a static demo.

## Gotchas

The artifact workflow provides `PORT` and `BASE_PATH`; local Vite builds need those variables set explicitly.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
