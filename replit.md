# XomoGambia

A marketplace for verified service companies in The Gambia — browse, quote, book, and track local businesses.

## Run & Operate

| Command | Purpose |
|---------|---------|
| `pnpm --filter @workspace/xomogambia run dev` | Start Expo app (port 24933) |
| `pnpm --filter @workspace/admin run dev` | Start Admin web app (port 23744) |
| `pnpm --filter @workspace/api-server run dev` | Start API server (port 8080) |
| `pnpm run typecheck` | Full typecheck across all packages |
| `pnpm install` | Install / sync all workspace deps |

**Required env vars** (copy `.env.example` → `.env` to run locally):
- `PORT` — API server listen port (set by Replit automatically)
- `EXPO_PUBLIC_API_URL` — API base URL for native/local builds (auto-detected on Replit web)
- `DATABASE_URL` — PostgreSQL connection string (optional; falls back to JSON file store)

## Stack

- **Monorepo**: pnpm workspaces, Node 24, TypeScript 5.9
- **Mobile**: Expo SDK 54, expo-router v6 (lazy bundling), React Native 0.81
- **Admin web**: React + Vite 7
- **API**: Express 5, esbuild (ESM bundle)
- **Data store**: JSON file (`artifacts/api-server/data/providers.json`), Drizzle ORM ready for Postgres

## Where things live

```
artifacts/
  xomogambia/          Expo mobile app
    app/               expo-router file-based routes
    lib/api.ts         API client (getApiBase auto-detects URL)
    metro.config.js    Metro config — singleton React fix + ctx.web.js redirect
    _expo_router_ctx_web.js  custom require.context with correct relative path
  admin/               React/Vite admin panel
  api-server/
    src/routes/        Express routes (health, providers)
    data/providers.json  local provider submissions store
  .env.example         env vars for local dev
```

## Architecture decisions

- **Metro `_ctx.web.js` override**: `babel-plugin-transform-inline-environment-variables` inlines `EXPO_ROUTER_APP_ROOT` as an absolute path; Metro's `require.context` misinterprets it as relative → empty route context. Fixed by redirecting `expo-router/_ctx` to a local file that uses `./app` (relative).
- **React singleton pinning**: pnpm's virtual node_modules can surface two React instances causing "Invalid hook call". `metro.config.js` pins `react`, `react-dom`, `react-native`, `react-native-web` to a single copy via `resolver.resolveRequest`.
- **API URL detection**: `lib/api.ts` checks `EXPO_PUBLIC_API_URL` first, then strips `.expo.` from the Expo subdomain to reach the main Replit proxy where `/api` is routed.
- **`--env-file-if-exists`**: API server start script loads `.env` automatically on Node 24 without a dotenv dependency.
- **File-based data store**: Provider submissions are stored in `data/providers.json` (no DB required to run). Add `DATABASE_URL` to switch to Postgres via Drizzle.

## Product

- **Onboarding** → sign up / sign in → role-based home (client vs provider)
- **Browse** categories and top-rated companies, search, view company profiles
- **Quotes** — request and track quotes from service providers
- **Jobs** — job lifecycle management
- **Provider registration** — apply for verification, pending admin approval
- **Admin panel** — approve/reject provider applications

## User preferences

_Populate as you build_

## Gotchas

- Always restart the Expo workflow after changing `metro.config.js` or `babel.config.js` — Metro caches transforms aggressively.
- The `--clear` flag in the Expo workflow command clears Metro cache on each restart (intentional).
- `expo-local-authentication` v55 is installed (a newer SDK version than expected by SDK 54); it works but triggers a version warning — can be ignored for now.
- Provider submissions data survives restarts in `artifacts/api-server/data/providers.json`.

## Pointers

- Metro config: `artifacts/xomogambia/metro.config.js`
- Custom ctx: `artifacts/xomogambia/_expo_router_ctx_web.js`
- API client: `artifacts/xomogambia/lib/api.ts`
- API routes: `artifacts/api-server/src/routes/`
