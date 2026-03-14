# DECISIONS

## 2026-03-14 — Realtime strategy
- Decision: Use Supabase Realtime subscriptions directly from client components for dashboard live cards.
- Rationale: Keeps live updates lightweight without introducing additional websocket infra.

## 2026-03-14 — Reliability metrics calculation
- Decision: Compute MTBF/MTTR/Uptime via a Postgres view (`equipment_reliability_metrics`).
- Rationale: Centralizes analytics logic close to data and improves query consistency.

## 2026-03-14 — Work order lifecycle
- Decision: Extend status lifecycle to include `assigned` and persist technician assignment/completion fields.
- Rationale: Supports practical maintenance execution flow and auditability.

## 2026-03-14 — View security hardening
- Decision: Set `security_invoker = true` on reliability view.
- Rationale: Ensures querying user permissions and RLS context are respected.

## 2026-03-14 - Admin onboarding model
- Decision: Use signup metadata to branch onboarding behavior by role (admin creates facility; non-admin must provide existing facility code).
- Rationale: Keeps onboarding self-serve while preserving facility isolation and RBAC boundaries.

## 2026-03-14 - Sidebar responsiveness and persistence
- Decision: Keep sidebar inside shared dashboard layout and implement mobile drawer toggle in AppShell.
- Rationale: Prevents full shell reloads during internal navigation and improves mobile usability.
