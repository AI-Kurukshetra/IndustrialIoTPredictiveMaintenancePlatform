create or replace view public.equipment_reliability_metrics as
with downtime as (
  select
    equipment_id,
    facility_id,
    coalesce(start_time, started_at) as start_ts,
    coalesce(end_time, ended_at, now()) as end_ts
  from public.downtime_events
),
downtime_agg as (
  select
    equipment_id,
    facility_id,
    count(*) as failure_count,
    avg(extract(epoch from (end_ts - start_ts))) as avg_repair_seconds,
    sum(extract(epoch from (end_ts - start_ts))) as total_downtime_seconds
  from downtime
  group by equipment_id, facility_id
),
history as (
  select
    equipment_id,
    facility_id,
    count(*) as maintenance_events
  from public.maintenance_history
  group by equipment_id, facility_id
)
select
  e.id as equipment_id,
  e.facility_id,
  coalesce(d.failure_count, 0) as failure_count,
  coalesce(round((d.avg_repair_seconds / 3600.0)::numeric, 2), 0) as mttr_hours,
  case
    when coalesce(d.failure_count, 0) = 0 then null
    else round(((30 * 24.0) / d.failure_count)::numeric, 2)
  end as mtbf_hours,
  coalesce(
    round(
      greatest(0, ((30 * 24 * 3600.0) - coalesce(d.total_downtime_seconds, 0)) / (30 * 24 * 3600.0) * 100)::numeric,
      2
    ),
    100
  ) as uptime_percent,
  coalesce(h.maintenance_events, 0) as maintenance_events
from public.equipment e
left join downtime_agg d on d.equipment_id = e.id and d.facility_id = e.facility_id
left join history h on h.equipment_id = e.id and h.facility_id = e.facility_id;
