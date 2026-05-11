# XomoGambia

A marketplace for verified service companies in The Gambia — browse, quote, book, and track local businesses.

## Local development (laptop)

### Prerequisites
- **Node.js 22+** — [nodejs.org](https://nodejs.org) (LTS is fine)
- **pnpm 10+** — `npm install -g pnpm`
- **PostgreSQL** — local install **or** any hosted Postgres (Supabase free tier works great)

### 1 — Clone and install
```bash
git clone <repo-url>
cd xomogambia
pnpm install
```

### 2 — Set environment variables
Copy the root example and fill in your database URL:
```bash
cp .env.example .env
```
Edit `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/xomogambia
PORT=8080
NODE_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:8080
```
For the Expo app specifically (needed for native iOS/Android builds):
```bash
cp artifacts/xomogambia/.env.example artifacts/xomogambia/.env
# set EXPO_PUBLIC_API_URL=http://<your-machine-ip>:8080 for physical device testing
```

### 3 — Push schema and seed
Creates all tables then inserts the 15 seed companies and 16 reviews:
```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
```

### 4 — Run the servers
Open three terminals (or use a process manager like [concurrently](https://npmjs.com/package/concurrently)):

| Terminal | Command | URL |
|----------|---------|-----|
| API | `pnpm --filter @workspace/api-server run dev` | http://localhost:8080 |
| Admin | `pnpm --filter @workspace/admin run dev` | http://localhost:23744/admin |
| Mobile | `pnpm --filter @workspace/xomogambia run dev` | http://localhost:24933 (web) or scan QR in Expo Go |

### Tips
- On a physical phone, set `EXPO_PUBLIC_API_URL=http://<laptop-ip>:8080` in `artifacts/xomogambia/.env` — the phone must be on the same Wi-Fi network.
- The seed command is safe to re-run — it skips rows that already exist (`ON CONFLICT DO NOTHING`).
- To fully reset: drop and recreate the database, then run `push` + `seed` again.

---

## Run & Operate (Replit)

| Command | Purpose |
|---------|---------|
| `pnpm --filter @workspace/xomogambia run dev` | Start Expo app (port 24933) |
| `pnpm --filter @workspace/admin run dev` | Start Admin web app (port 23744) |
| `pnpm --filter @workspace/api-server run dev` | Start API server (port 8080) |
| `pnpm --filter @workspace/db run push` | Push schema changes to DB |
| `pnpm --filter @workspace/db run seed` | Seed marketplace data |
| `pnpm run typecheck` | Full typecheck across all packages |

**Required env vars** (set automatically on Replit, copy `.env.example` → `.env` locally):
- `DATABASE_URL` — PostgreSQL connection string (**required** — no fallback store)
- `PORT` — API server listen port (default 8080)
- `EXPO_PUBLIC_API_URL` — API base URL for native builds (auto-detected on Replit web)

---

## Stack

- **Monorepo**: pnpm workspaces, Node 24, TypeScript 5.9
- **Mobile**: Expo SDK 54, expo-router v6 (lazy bundling), React Native 0.81
- **Admin web**: React + Vite 7
- **API**: Express 5, esbuild (ESM bundle)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db/`)

## Where things live

```
lib/
  db/
    src/schema/index.ts    Drizzle schema (5 tables + enums)
    src/seed.ts            Seed script (companies + reviews)
    drizzle.config.ts      Drizzle-kit config (reads DATABASE_URL)
artifacts/
  xomogambia/             Expo mobile app
    app/                  expo-router file-based routes
    lib/api.ts            API client (getApiBase auto-detects URL)
    context/AppContext.tsx DB-connected state (API + offline cache)
    context/AuthContext.tsx DB-connected auth (API + AsyncStorage fallback)
    metro.config.js       Metro config — singleton React fix + ctx.web.js redirect
  admin/                  React/Vite admin panel
  api-server/
    src/routes/           Express routes (companies, providers, users, quotes, jobs)
  .env.example            Env vars for local dev
```

## Architecture decisions

- **Metro `_ctx.web.js` override**: `babel-plugin-transform-inline-environment-variables` inlines `EXPO_ROUTER_APP_ROOT` as an absolute path; Metro's `require.context` misinterprets it as relative → empty route context. Fixed by redirecting `expo-router/_ctx` to a local file that uses `./app` (relative).
- **React singleton pinning**: pnpm's virtual node_modules can surface two React instances causing "Invalid hook call". `metro.config.js` pins `react`, `react-dom`, `react-native`, `react-native-web` to a single copy via `resolver.resolveRequest`.
- **API URL detection**: `lib/api.ts` checks `EXPO_PUBLIC_API_URL` first, then strips `.expo.` from the Expo subdomain to reach the main Replit proxy where `/api` is routed.
- **`--env-file-if-exists`**: API server and seed script load `.env` automatically on Node 22+ without a dotenv dependency.
- **Providers = Companies**: The `providers` table serves dual purpose — pending rows are admin submissions awaiting approval, `approvalStatus = 'approved'` rows are the live marketplace companies.
- **Offline cache**: AppContext and AuthContext cache API responses in AsyncStorage so the app works after a successful first load even without connectivity.

## Product

- **Onboarding** → sign up / sign in → role-based home (client vs provider)
- **Browse** categories and top-rated companies, search, view company profiles
- **Quotes** — request and track quotes from service providers
- **Jobs** — job lifecycle management (upcoming → in-progress → completed)
- **Provider registration** — apply for verification, pending admin approval
- **Admin panel** — approve/reject provider applications

## User preferences

_Populate as you build_

## Gotchas

- Always restart the Expo workflow after changing `metro.config.js` or `babel.config.js` — Metro caches transforms aggressively.
- The `--clear` flag in the Expo workflow command clears Metro cache on each restart (intentional).
- `expo-local-authentication` v55 is installed (a newer SDK version than expected by SDK 54); it works but triggers a version warning — can be ignored for now.
- Schema changes require `pnpm --filter @workspace/db run push` — Drizzle will diff and apply only what changed.

## Pointers

- Schema: `lib/db/src/schema/index.ts`
- Seed: `lib/db/src/seed.ts`
- Metro config: `artifacts/xomogambia/metro.config.js`
- API client: `artifacts/xomogambia/lib/api.ts`
- API routes: `artifacts/api-server/src/routes/`
