# Rust Wipes — project memory for Claude sessions

This file is the durable context for any Claude (Code) session working on this repo. Read it before doing anything else.

## What this is

A Next.js calendar app that aggregates **upcoming wipe schedules** for Rust game servers across multiple hosters (Rustoria, Rustafied, Reddit, Facepunch, Pickle, Vital, etc.). The user wants to know **before** a server wipes so they can be online for the start — which is the best part of Rust.

## Critical product decision: how we know about future wipes

**BattleMetrics is reactive, not predictive.** Its `last_wipe` field tells you a wipe already happened — by then the user is too late. So:

- The **source of truth** for future wipes is an explicit `WipeScheduleRule` (RRULE + IANA timezone) per server, derived from what hosters announce in their Discords ("every Thursday 7PM GMT", "1st Thursday is force wipe").
- We **project** these rules forward into concrete `WipeEvent`s for any date window.
- BattleMetrics is kept as an optional **drift-validation** signal (compare scheduled vs actual `last_wipe`) — not as the primary source.

If a future task suggests "scrape BattleMetrics for upcoming wipes" — push back. That's the wrong direction. The right direction is better Discord ingestion (`src/lib/ingest/parseSchedule.ts`) plus admin UI to persist parsed rules.

## Stack

- Next.js 15 (App Router) + TypeScript **strict** (no `any`)
- React 19 — note: the global `JSX` namespace was removed; use `React.JSX.Element` or rely on inferred return types
- Tailwind CSS (dark-mode class strategy, `cn()` helper at `src/lib/cn.ts`)
- Prisma + SQLite (file DB at `prisma/dev.db`, easy to swap to Postgres)
- `rrule` for recurrence, `date-fns-tz` for timezone math
- Vitest (jsdom for `.test.tsx` via `environmentMatchGlobs`)

## Data model (`prisma/schema.prisma`)

- **Host** — a hoster (name, website, optional Discord guild/invite)
- **Server** — { host, name, type: `official|community|modded`, playerRestriction: `none|solo|duo|trio|quad|quintet|other`, region, tags (JSON-text), battlemetricsId?, lastWipeAt? }
- **WipeScheduleRule** — { server, rrule (RFC5545 string), dtstart, timezone (IANA), kind: `weekly|biweekly|forced|custom`, label }
- **WipeEventOverride** — { server, occursAt, skip? } — explicit add/skip
- **WipeEvent** (NOT a DB table) — projected output type defined in `src/types/wipes.ts`

Schema is final for v1 — don't modify casually. Shared zod schemas live in `src/types/wipes.ts`. Use the Prisma singleton from `src/lib/db.ts`; don't `new PrismaClient()` anywhere else.

## Architecture map

```
src/lib/recurrence.ts         RRULE → WipeEvent[] (timezone-correct, DST-safe, override-aware)
src/lib/_wipesProject.ts      Smaller projector currently used by /api/wipes — TODO unify with recurrence.ts
src/lib/battlemetrics.ts      Read-only client (drift validation, not primary source)
src/lib/ingest/parseSchedule.ts  Free-text Discord announcement → rule drafts (not yet wired to a UI)
src/lib/serverColors.ts       Deterministic per-host palette (FNV-1a → 12 static Tailwind classes)
src/lib/useSelectedServers.ts SSR-safe localStorage hook for picker selection (key: rw:selectedServers)
src/components/CalendarMonth.tsx, DayDetail.tsx, Filters.tsx, ServerPicker.tsx, Legend.tsx
src/components/Nav.tsx, Footer.tsx, ThemeToggle.tsx (theme key: rw:theme)
src/app/page.tsx              Home — wires picker + filters + calendar against /api/servers + /api/wipes
src/app/api/wipes/route.ts    GET projected events for a date window (uses _wipesProject)
src/app/api/servers/route.ts  CRUD; GET includes host relation (the home page picker depends on this)
src/app/api/hosts/route.ts    CRUD
src/app/api/server-schedules/route.ts  Add/remove rules
src/app/preview/<unit>/page.tsx        Per-feature isolated preview routes
prisma/seed.ts                Idempotent seed: 6 hosters, 17 servers, 27 rules
```

## Conventions

- TypeScript strict, no `any`. Validate boundary I/O with zod.
- Server components by default; only `"use client"` where state/effects/event handlers are needed.
- Tailwind classes must be **static literals** so the content scanner picks them up — use `switch`/maps, not `bg-${color}-500`.
- Don't write comments that just describe what the code does. Comment only on non-obvious why (constraints, invariants, workarounds).
- Don't add features beyond what's asked. No premature abstractions, no scaffolded "for later" hooks.
- Don't create README/docs files unless asked. (This `CLAUDE.md` is the memory file — extending it is fine when the user asks for memory updates.)
- Branch convention: this repo's primary work branch is `claude/rust-wipe-calendar-O1JNL`. There may not be a `main` yet — check before merging there.

## How to run / verify

```bash
npm install
cp .env.example .env
npx prisma generate && npx prisma db push && npm run seed
npm run dev          # http://localhost:3000
npm test             # 55 tests across 12 files should pass
npm run build        # must succeed cleanly (catches type + SSR errors)
```

`RUN_LOCALLY.md` is a user-facing runbook intended to be handed to a fresh Claude Code session running on the user's local machine. Don't treat it as canonical — this file (`CLAUDE.md`) is.

## How this app got built (so you don't redo it)

Built in one session via `/batch`-style parallel-worker orchestration: a shared scaffold was committed to `claude/rust-wipe-calendar-O1JNL`, then 13 isolated worktree agents each built one slice (recurrence, BM client, parser, /api/wipes, CRUD, calendar, day drawer, filters, picker, color, layout, seed, home composition) and opened a draft PR. The PRs were then **consolidated into a single integration commit** (`102b182`) on the same branch — file-level cherry-pick + manual reconciliation of `package.json`, `vitest.config.ts`, `src/app/layout.tsx`, and `src/app/page.tsx`. The 13 worker PRs were closed; their branches still exist on the remote and could be deleted (the user hasn't asked yet).

If asked to "split this work in parallel again," remember: the truly independent slicing only works if there's a shared scaffold (types, db client, schema) committed first, AND each slice ships an isolated `/preview/<unit>` route so its PR is independently viewable. Greenfield "all parallel from empty" doesn't actually work cleanly — every PR will conflict on `package.json` etc.

## Known gaps / where to extend next

1. **`/api/wipes` uses `_wipesProject.ts` instead of `recurrence.ts`.** Both work, but `recurrence.ts` is the better implementation (DST-correct, handles biweekly + monthly forced rules properly). Swap when convenient — interface is similar.
2. **Discord ingest has no UI.** `parseSchedule()` exists and is tested. Add a textarea + "Parse → save" button on `/preview/admin` that calls it then `POST /api/server-schedules` for each draft.
3. **BattleMetrics drift signal isn't surfaced.** Client exists; nothing in the UI reads it. Could add a small badge on a server row when scheduled-vs-actual diverges by >30 minutes.
4. **Calendar pills color by server `type`.** The richer per-host palette in `serverColors.ts` is unused on the main calendar — wiring it in would make hosters distinguishable at a glance.
5. **No background poller.** Wipes are projected on demand from rules. Fine for v1; if the user wants notifications, add a cron + a Subscription model.
6. **Seed `dtstart` is fixed to 2026-01-01.** Deterministic for tests but means projections only work for windows after that anchor. Real production data would use rolling anchors.

## Things to NOT do without asking

- Don't change `prisma/schema.prisma` (migrations are not yet wired; SQLite db is push-only).
- Don't push to a `main` branch (it may not exist; the user's primary branch is `claude/rust-wipe-calendar-O1JNL`).
- Don't switch the data source to "scrape BattleMetrics for upcoming wipes" — see top of file.
- Don't add a heavy auth/multi-tenant layer until the user asks; the picker selection is per-browser via localStorage by design.
- Don't include the model identifier `claude-opus-4-7[1m]` in any commit message, PR body, code comment, or other artifact pushed to the repo. Chat replies only.

## User context

The user is a Rust player who hosts/follows multiple servers and wants one place to see when his favorite servers wipe — well in advance. He's pragmatic, asks short questions, and is happy with reasonable defaults when he says "whatever works best for you". He runs Claude Code both on the web (this session was) and inside VS Code locally.
