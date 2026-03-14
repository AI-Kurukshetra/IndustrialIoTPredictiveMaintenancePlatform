# CHANGELOG

## 2026-03-14
- Added full initial app scaffold (Next.js App Router + Supabase integration).
- Added baseline schema and seed scripts.
- Added auth, role checks, and protected pages.
- Added landing page and dashboard modules.
- Added equipment CRUD with server actions and validations.
- Added realtime sensor monitoring cards and live dashboard updates.
- Added maintenance schedules and work order lifecycle workflow.
- Added downtime event start/end tracking.
- Added reliability metrics view and dashboard KPI integration.
- Added alert center filters, acknowledgement, and history actions.
- Added pagination support and performance indexes.
- Added security fix migration for reliability view (`security_invoker = true`).
- Added role-based signup onboarding (admin creates facility; other roles join via facility code).
- Added admin module pages: Manage Users and Manage Facility.
- Updated dashboard shell with responsive burger menu, admin nav items, and role badge cleanup.
- Added middleware protection for /admin routes.
- Added separate extended seed script at supabase/seed_extended.sql with 5 facilities, 20 role users, equipment, sensors, readings, maintenance, alerts, health scores, and downtime data.
