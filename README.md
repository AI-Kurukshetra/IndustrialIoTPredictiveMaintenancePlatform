# Industrial IoT Predictive Maintenance Platform

Production-ready scaffold for monitoring industrial assets, ingesting sensor telemetry, and generating predictive maintenance insights.

## Stack
- Next.js 15 (App Router) + TypeScript (strict)
- TailwindCSS
- Supabase (Postgres, Auth, Realtime, RLS)
- Deploy target: Vercel

## Quick Start
1. Install dependencies:
```bash
npm install
```
2. Configure environment:
```bash
cp .env.example .env.local
```
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run database migration and seed in Supabase SQL editor:
- `supabase/migrations/202603140001_init_schema.sql`
- `supabase/seed.sql`
4. Start local dev server:
```bash
npm run dev
```

## Scripts
- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run Next.js lint checks
- `npm run typecheck` - Run strict TypeScript checks

## Core Modules
- Equipment Asset Management
- Sensor Data Collection + Simulation (`POST /api/simulator`)
- Real-time Monitoring (Supabase realtime-ready tables)
- Predictive Health Scoring (`POST /api/health`)
- Alert & Notification System
- Maintenance Work Orders
- Dashboard & Historical Analytics
- RBAC + Multi-facility data boundaries (RLS)

## Project Layout
- `app/` routes and API handlers
- `components/` UI, dashboard, charts, forms
- `lib/supabase/` client/server helpers
- `lib/services/` domain data access and predictive logic
- `lib/validations/` Zod schemas
- `types/` domain models
- `supabase/` migration and seed SQL
