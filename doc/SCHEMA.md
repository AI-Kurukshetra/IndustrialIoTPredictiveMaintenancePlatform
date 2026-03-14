# SCHEMA

## Database
Supabase Postgres with RLS enabled across all domain tables.

## Core Tables
- `facilities`
- `users` (linked to `auth.users`)
- `equipment`
- `sensors`
- `sensor_readings`
- `alerts`
- `maintenance_schedules`
- `work_orders`
- `maintenance_history`
- `equipment_health_scores`
- `downtime_events`

## Key Relations
- `facilities -> equipment`
- `equipment -> sensors`
- `sensors -> sensor_readings`
- `equipment -> alerts`
- `equipment -> maintenance_schedules -> work_orders`
- `work_orders -> maintenance_history`

## RLS Model
- Facility-scoped access via `current_user_facility_id()`.
- Policies enforce that rows are readable/writable only for a user’s facility.
- User update policy restricted to self row.

## Realtime-enabled Tables
- `sensor_readings`
- `alerts`
- `equipment_health_scores`

## Migration History
- `202603140001_init_schema.sql` — initial schema, RLS, realtime publication, auth trigger.
- `202603140002_maintenance_workflow.sql` — assignment/completion fields and `assigned` status.
- `202603140003_downtime_tracking.sql` — downtime compatibility columns (`start_time`, `end_time`, `cause`).
- `202603140004_reliability_metrics.sql` — reliability metrics view.
- `202603140005_alert_center.sql` — alert acknowledgement fields and indexes.
- `202603140006_performance_indexes.sql` — additional performance indexes.
- `202603140007_fix_reliability_view_security.sql` — enforce `security_invoker = true` for view safety.
