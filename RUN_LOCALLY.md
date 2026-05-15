# Pull and run the Rust Wipes app locally

Hi Claude — please get the Rust Wipes calendar app running on this machine. It's a Next.js + Prisma + SQLite app on the `claude/rust-wipe-calendar-O1JNL` branch of `https://github.com/Ayco23/Rust-wipes`.

## What you're setting up

A calendar app that aggregates Rust server wipe schedules across multiple hosters. The home page shows a month grid of upcoming wipes; the sidebar has a server picker and filter chips; clicking a day opens a drawer with that day's wipes.

## Prerequisites to verify first

Run these and report any that are missing — install whatever's needed before continuing:

```bash
node --version   # need v20 or higher
npm --version
git --version
```

If Node is missing or older than 20, install it from https://nodejs.org (or via `nvm install 20 && nvm use 20`).

## Steps

### 1. Clone (or pull, if it already exists)

```bash
# If the repo doesn't exist locally yet:
git clone https://github.com/Ayco23/Rust-wipes.git
cd Rust-wipes

# If it already exists, just update:
cd Rust-wipes
git fetch origin
```

### 2. Switch to the feature branch

```bash
git checkout claude/rust-wipe-calendar-O1JNL
git pull
```

### 3. Install dependencies

```bash
npm install
```

This installs Next.js 15, React 19, Prisma, Tailwind, rrule, date-fns-tz, vitest, and testing-library. Expect a few moderate `npm audit` warnings — they're transitive and safe to ignore.

### 4. Set up environment + database

```bash
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
```

Expected output of the seed step: `Seed complete: 6 hosts.` This populates SQLite with 6 hosters (Rustoria, Rustafied, Reddit, Facepunch Official, Pickle, Vital), 17 servers, and 27 schedule rules.

### 5. (Optional but recommended) Run the test suite

```bash
npm test
```

Should report `Test Files  12 passed (12)` and `Tests  55 passed (55)`. If anything fails, stop and tell me — don't try to "fix" tests blindly.

### 6. Start the dev server

```bash
npm run dev
```

Wait for `✓ Ready in <Nms>`, then open http://localhost:3000 in a browser.

## What I should see when it works

- **Home page (`/`)**: Header "Rust Wipes" + month label (current month) + Prev/Next buttons. Sidebar on the left shows a "Servers" search list (17 servers) and "Filters" chips for Type / Player Restriction / Host / Region. Right side is a 7×6 calendar grid with colored wipe pills on the days that have scheduled wipes (Thursday weekly + 1st Thursday of each month for most servers; Friday and Saturday for a few).
- **Click any day with a pill**: a drawer slides in from the right showing each wipe at that time, with type/restriction/kind badges.
- **Toggle filters**: pills disappear/reappear as you narrow by type or restriction.
- **Pick servers in the sidebar**: when at least one is selected, only those servers' wipes show. Selection persists in `localStorage` so it survives a page reload.
- **Theme toggle (top right)**: switches dark/light mode.

## Useful preview routes

Each feature has its own preview route so you can sanity-check pieces in isolation:

- http://localhost:3000/preview — index of all preview routes
- http://localhost:3000/preview/admin — list hosters/servers + a basic add form
- http://localhost:3000/preview/calendar — calendar grid with mock data
- http://localhost:3000/preview/day — day detail drawer
- http://localhost:3000/preview/filters — filter panel state echo
- http://localhost:3000/preview/picker — server picker
- http://localhost:3000/preview/legend — color legend
- http://localhost:3000/preview/recurrence — RRULE → next 30 days projection
- http://localhost:3000/preview/ingest — paste a Discord wipe announcement and see parsed rules
- http://localhost:3000/preview/battlemetrics — search the live BattleMetrics API by server name

## Useful APIs (curl-able)

```bash
curl http://localhost:3000/api/hosts
curl http://localhost:3000/api/servers
curl 'http://localhost:3000/api/wipes?from=2026-05-15T00:00:00Z&to=2026-07-15T00:00:00Z'
```

## If something breaks

- **`Error: P1003: Database file not found`** → re-run `npx prisma db push` and `npm run seed`.
- **`Module not found: Can't resolve '@prisma/client'`** → run `npx prisma generate`.
- **Port 3000 in use** → either kill the other process, or run `PORT=3001 npm run dev`.
- **Build/type errors after a git pull** → `rm -rf .next node_modules && npm install && npx prisma generate`.

## Project layout (for orientation, no need to change anything)

```
prisma/schema.prisma           # Host, Server, WipeScheduleRule, WipeEventOverride
prisma/seed.ts                 # 6 hosters / 17 servers / 27 rules
src/types/wipes.ts             # zod schemas + shared types
src/lib/db.ts                  # Prisma client singleton
src/lib/recurrence.ts          # RRULE → WipeEvent[] projection (tz-aware, DST-safe)
src/lib/_wipesProject.ts       # Smaller projector used by /api/wipes (will be unified later)
src/lib/battlemetrics.ts       # Read-only client for drift validation
src/lib/ingest/parseSchedule.ts # Free-text Discord announcement → rule drafts
src/lib/serverColors.ts        # Deterministic color per host/type/restriction
src/lib/useSelectedServers.ts  # localStorage-backed selection hook
src/components/CalendarMonth.tsx
src/components/DayDetail.tsx
src/components/Filters.tsx
src/components/ServerPicker.tsx
src/components/Legend.tsx
src/components/Nav.tsx, Footer.tsx, ThemeToggle.tsx
src/app/page.tsx               # Home — wires all the above to /api/wipes
src/app/api/wipes/route.ts     # GET — projects schedules into events for a date window
src/app/api/servers/route.ts, [id]/route.ts
src/app/api/hosts/route.ts, [id]/route.ts
src/app/api/server-schedules/route.ts
```

That's it — just walk through steps 1–6 above and tell me what you see at http://localhost:3000.
