-- Seed baseline facilities, equipment, sensors, readings, alerts, and work orders.

insert into public.facilities (id, name, code, location)
values
  ('11111111-1111-1111-1111-111111111111', 'Plant Alpha', 'ALPHA', 'Houston, TX'),
  ('22222222-2222-2222-2222-222222222222', 'Plant Beta', 'BETA', 'Phoenix, AZ')
on conflict (id) do nothing;

insert into public.equipment (facility_id, name, equipment_type, serial_number, status)
select
  case when n <= 5 then '11111111-1111-1111-1111-111111111111'::uuid else '22222222-2222-2222-2222-222222222222'::uuid end,
  'Machine-' || lpad(n::text, 2, '0'),
  case when n % 2 = 0 then 'Compressor' else 'Pump' end,
  'SN-' || lpad(n::text, 5, '0'),
  case when n in (3, 8) then 'maintenance'::public.equipment_status else 'online'::public.equipment_status end
from generate_series(1, 10) as n
on conflict (serial_number) do nothing;

insert into public.sensors (facility_id, equipment_id, sensor_type, unit)
select e.facility_id, e.id, s.sensor_type, s.unit
from public.equipment e
cross join (
  values
    ('temperature', 'C'),
    ('vibration', 'mm/s'),
    ('pressure', 'psi')
) as s(sensor_type, unit)
where not exists (
  select 1 from public.sensors existing where existing.equipment_id = e.id and existing.sensor_type = s.sensor_type
);

insert into public.sensor_readings (facility_id, equipment_id, sensor_id, reading_value, recorded_at)
select
  s.facility_id,
  s.equipment_id,
  s.id,
  case
    when s.sensor_type = 'temperature' then round((60 + random() * 40)::numeric, 2)
    when s.sensor_type = 'vibration' then round((6 + random() * 12)::numeric, 2)
    else round((90 + random() * 60)::numeric, 2)
  end,
  now() - (g.n || ' minutes')::interval
from public.sensors s
cross join generate_series(1, 20) as g(n);

insert into public.maintenance_schedules (facility_id, equipment_id, cadence_days, next_due_at)
select facility_id, id, 30, now() + interval '7 days'
from public.equipment
where not exists (
  select 1 from public.maintenance_schedules m where m.equipment_id = public.equipment.id
);

insert into public.work_orders (facility_id, equipment_id, maintenance_schedule_id, title, status, priority, due_date)
select
  m.facility_id,
  m.equipment_id,
  m.id,
  'Quarterly inspection - ' || e.name,
  case when row_number() over (order by m.created_at) % 2 = 0 then 'open'::public.work_order_status else 'in_progress'::public.work_order_status end,
  case when row_number() over (order by m.created_at) % 3 = 0 then 'high'::public.alert_severity else 'medium'::public.alert_severity end,
  now() + interval '5 days'
from public.maintenance_schedules m
join public.equipment e on e.id = m.equipment_id
limit 6;

insert into public.alerts (facility_id, equipment_id, title, message, severity, is_resolved)
select
  e.facility_id,
  e.id,
  'Abnormal vibration detected',
  'Vibration trend exceeded warning threshold on ' || e.name,
  case when e.name in ('Machine-04', 'Machine-09') then 'critical'::public.alert_severity else 'high'::public.alert_severity end,
  false
from public.equipment e
where e.name in ('Machine-02', 'Machine-04', 'Machine-07', 'Machine-09');

insert into public.equipment_health_scores (facility_id, equipment_id, score, model_version, calculated_at)
select
  e.facility_id,
  e.id,
  round((70 + random() * 25)::numeric, 2),
  'v1-threshold-rolling',
  now() - interval '1 hour'
from public.equipment e;
