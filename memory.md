# Session handoff — 2026-05-15

Read [CLAUDE.md](CLAUDE.md) first; it has architecture, conventions, branching/deploy. This file is the **delta from that** — what changed in this session, current data, and where to pick up.

## Where we landed

- **Live at https://whats-wiping.vercel.app** (Vercel + Neon Postgres, deploys from `main`).
- Trunk-based workflow; `main` is the only branch.

## Hosts currently seeded (8 hosts, 81 servers)

| Host | Servers | Type | Notes |
|---|---|---|---|
| **BestRust** | 27 | community | 6 monthly + 21 weekly; all EU vanilla; full connect URLs |
| **Rustafied** | 16 | official | weekly Thu/Fri/Mon + biweekly + monthly variants; **no connect URLs** (BM wouldn't expose them) |
| **Reddit** (rplayrust) | 8 | official | weekly/biweekly/monthly mix; full connect URLs |
| **RustForNoobs** | 16 | community/modded | vanilla + 2x/5x/10x; full connect URLs |
| **Rusticated** | 6 | official | weekly + monthly; full connect URLs (domain-based) |
| **RustVikings** | 7 | community | one server per weekday; full connect URLs |
| **Enjoy** | 2 | community | true-vanilla, no-BP-wipe; **no connect URLs** |
| **Lagoon** | 1 | community | 1.5x marketed-as-vanilla; EU only; **no connect URL** |

**Connect URL gaps**: Rustafied (16), Enjoy (2), Lagoon (1). Hosts publish schedule but didn't include IP in the Discord pins the user pasted. Get from BattleMetrics or Discord if user wants them filled in.

## Biweekly anchor uncertainty

Three biweekly schedules use anchors I guessed from the most-recent past Thursday — these will be one week off if I guessed the wrong phase. Verify against the host's "next wipe" before trusting:

- **Reddit EU Medium** — anchor `2026-05-07T14:00Z` (verified May 21 wipe day matches Discord ✓)
- **Rustafied Medium-Small / Medium-Large / Trio** — anchor `2026-05-21T14:00Z` (3rd Thursday convention; user-confirmed via "3rd & 5th Thursday" published rule)
- **Enjoy Solo/Duo** — anchor `2026-05-14T16:00Z`. **NOT verified.** If next-wipe doesn't match May 28, shift anchor by 7 days.

## What we built this session (not just data)

UI changes (state, not in `CLAUDE.md`'s architecture map yet):
- Host-based picker (`src/components/HostPicker.tsx`) replaces server picker; selection lifted into `page.tsx` (one source of truth; props down).
- `useSelectedHosts` hook (`rw:selectedHosts` localStorage key); old `useSelectedServers` left on disk for `/preview/picker` only.
- DayDetail drawer shows `connectUrl` with a Copy button that writes `client.connect <addr>` to clipboard.
- Calendar: Monday-first week, 24h time, European date format, force-wipe day (1st Thursday) tinted red with FORCE badge.
- Dark mode coverage for Filters, HostPicker.
- `/api/wipes` now uses `recurrence.ts` (rrule-based, monthly + biweekly + DST-correct), not the old `_wipesProject.ts` stub. The stub file still exists but is unused.

Schema change:
- Added `connectUrl String?` to `Server` model. **Schema is push-only**; no migration file.
- Provider swapped from `sqlite` to `postgresql`. Local dev requires Neon (or a local Postgres) — no SQLite fallback.

Tooling:
- `npm run verify` (= `scripts/verify.ts`) compares projected last-wipe vs BattleMetrics. Manual only — not on CI. Name-based BM matching is too noisy (collides on `<host> Monthly` vs `<host> Weekly`). Reliable automation needs per-server BattleMetrics IDs.

## Things the user explicitly approved this session

- Schema changes ok when explicitly requested (overrides CLAUDE.md's "schema is final for v1" caveat for the `connectUrl` add).
- "Ship it" = push to prod, don't ask. User is pragmatic about velocity.
- Branch cleanup ok when explicitly authorized — they had to grant it after the auto-classifier blocked me.

## Outstanding work, priority order

1. **LLM ingest admin route**. User explicitly preferred this over a regex-based parser. Spec discussed: paste Discord text → Anthropic API call with structured-output prompt → return `WipeScheduleRule` drafts → review table → POST to existing `/api/server-schedules`. No new API surface needed beyond the existing endpoint. Anthropic SDK + prompt cache.
2. **Per-server BattleMetrics ID map**. Once present, the drift checker can run on cron without false positives (current matching collides on similar names). Store on `Server.battlemetricsId` (column exists in schema, unused).
3. **Missing connect URLs**: Rustafied (16), Enjoy (2), Lagoon (1).
4. **Verify Enjoy Solo/Duo biweekly anchor** — possibly off by one week.

## Things to NOT do (additions to CLAUDE.md's list)

- Don't try to make the drift checker (`scripts/verify.ts`) reliable via name-search. Need BM IDs. We already burned time on port-based matching too; both are dead ends.
- Don't recreate the auto-fail GitHub Action for drift checking until BM ID mapping is done.

## User-facing context

The user is in Europe (CEST in summer). All seed timezones use `Europe/Paris` or `Europe/London` for that reason. They run Claude Code inside VS Code locally; sometimes also Claude Code on web. They appreciate concise updates and direct execution — not menus, not clarifying questions when the call is obvious. They said "I love you :D" at end of session, which I'm noting purely as a happy data point, not asking you to reciprocate weirdly.
