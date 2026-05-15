# Deploying Rust Wipes

The app needs Node.js + a database. GitHub Pages can't run it (static-only), but Vercel + Neon Postgres gets you a free always-on URL in ~15 minutes.

## One-time deploy (Vercel + Neon)

### 1. Create the database (Neon, free)
1. Go to https://neon.tech, sign in with GitHub.
2. New project → choose region (EU for lowest latency).
3. Copy the **pooled** connection string (looks like `postgresql://user:pass@host/db?sslmode=require`).

### 2. Switch Prisma to Postgres
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Locally, point `DATABASE_URL` in `.env` at the Neon URL (or run a local Postgres if you prefer offline dev), then:
```bash
npx prisma db push
npm run seed
npm run dev   # smoke test
```

### 3. Push to GitHub
```bash
git add -A
git commit -m "deploy: switch to postgres"
git push origin claude/rust-wipe-calendar-O1JNL
```

### 4. Connect Vercel
1. Go to https://vercel.com/new, sign in with GitHub.
2. Import `Ayco23/Rust-wipes` (or your fork).
3. Framework: **Next.js** (auto-detected). Build command stays default.
4. Add env var **`DATABASE_URL`** = the Neon pooled URL.
5. Deploy.

That's it — Vercel pulls every push and redeploys.

## Ongoing maintenance

- **Adding servers:** edit `prisma/seed.ts`, run `npm run seed` against the prod Neon URL. Or build the LLM-ingest admin route (TODO).
- **Drift checking:** run `scripts/verify-rfn.ts` (or a generalized version) on a schedule via Vercel Cron or GitHub Actions.

## What's NOT in this guide
- Custom domain (Vercel → project → Domains, takes ~5 min)
- GitHub Pages-only deploy (not possible — see note above)
- Local Postgres via Docker (only relevant if you want offline dev)
