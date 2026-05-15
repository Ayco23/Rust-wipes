# Rust Wipes

Calendar/scheduler for Rust game-server wipe cycles across multiple hosters.

## Why

The start of a wipe is the best part of Rust. Hosters publish wipe schedules in their Discords;
this app aggregates them into one calendar so you can plan ahead. BattleMetrics only knows when a
wipe *already happened* — this app stores explicit schedule rules so you know **before** it does.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma + SQLite
- `rrule` for recurrence, `date-fns-tz` for timezones
- Vitest

## Quick start

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Open http://localhost:3000 — and http://localhost:3000/preview for individual feature slices.

## Architecture

- `prisma/schema.prisma` — `Host`, `Server`, `WipeScheduleRule`, `WipeEventOverride`.
- `src/types/wipes.ts` — zod schemas + types shared across server/client.
- `src/lib/db.ts` — Prisma client singleton.
- `src/lib/recurrence.ts` — projects schedule rules into concrete events in a date window.
- `src/lib/battlemetrics.ts` — read-only client for drift detection.
- `src/app/api/wipes` — GET projected wipes for a date range, with filters.
- `src/app/api/servers`, `src/app/api/hosts` — admin CRUD.
- `src/components/CalendarMonth.tsx` — month grid view.
- `src/components/Filters.tsx`, `ServerPicker.tsx` — filtering and per-user selection.

## Conventions

- TypeScript strict; no `any`.
- Server components by default; client components only when state/effects are needed.
- Tailwind for styling, classes via `cn()` from `src/lib/cn.ts`.
- Use the Prisma client from `src/lib/db.ts` — don't instantiate locally.
