alter table public.downtime_events
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists cause text;

update public.downtime_events
set
  start_time = coalesce(start_time, started_at),
  end_time = coalesce(end_time, ended_at),
  cause = coalesce(cause, reason);

create index if not exists idx_downtime_equipment_start_time on public.downtime_events(equipment_id, start_time desc);
