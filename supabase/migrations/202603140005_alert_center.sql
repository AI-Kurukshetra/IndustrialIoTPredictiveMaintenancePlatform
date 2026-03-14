alter table public.alerts
  add column if not exists acknowledged_at timestamptz,
  add column if not exists acknowledged_by uuid references public.users(id) on delete set null;

create index if not exists idx_alerts_facility_severity_created on public.alerts(facility_id, severity, created_at desc);
create index if not exists idx_alerts_acknowledged_at on public.alerts(acknowledged_at);
