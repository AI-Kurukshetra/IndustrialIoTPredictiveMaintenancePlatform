-- Extended demo seed (keeps supabase/seed.sql untouched)
-- Creates 5 facilities, 20 users (4 roles x 5 facilities), equipment, sensors,
-- sensor data, maintenance schedules, work orders, maintenance history, alerts,
-- health scores, and downtime events.
--
-- Run in Supabase SQL Editor after migrations.
-- Login credentials for all seeded users: password123

begin;

-- 1) Facilities
with facility_seed(id, name, code, location) as (
  values
    ('a1111111-1111-1111-1111-111111111111'::uuid, 'North Ridge Plant', 'FAC-NORTH', 'Dallas, TX'),
    ('b2222222-2222-2222-2222-222222222222'::uuid, 'South River Plant', 'FAC-SOUTH', 'Atlanta, GA'),
    ('c3333333-3333-3333-3333-333333333333'::uuid, 'East Valley Plant', 'FAC-EAST', 'Raleigh, NC'),
    ('d4444444-4444-4444-4444-444444444444'::uuid, 'West Harbor Plant', 'FAC-WEST', 'San Diego, CA'),
    ('e5555555-5555-5555-5555-555555555555'::uuid, 'Central Forge Plant', 'FAC-CENTRAL', 'Chicago, IL')
)
insert into public.facilities (id, name, code, location)
select id, name, code, location from facility_seed
on conflict (id) do update
set name = excluded.name,
    code = excluded.code,
    location = excluded.location;

-- 2) Seed users in auth + public.users (idempotent)
create temporary table temp_seed_users (
  facility_id uuid not null,
  facility_code text not null,
  role public.user_role not null,
  full_name text not null,
  email text not null unique
) on commit drop;

insert into temp_seed_users (facility_id, facility_code, role, full_name, email)
select
  f.id,
  f.code,
  r.role,
  initcap(r.role::text) || ' - ' || f.code,
  lower(r.role::text) || '.' || lower(replace(f.code, 'FAC-', '')) || '@iiot-demo.local'
from public.facilities f
cross join (values
  ('operator'::public.user_role),
  ('technician'::public.user_role),
  ('manager'::public.user_role),
  ('admin'::public.user_role)
) as r(role)
where f.code in ('FAC-NORTH', 'FAC-SOUTH', 'FAC-EAST', 'FAC-WEST', 'FAC-CENTRAL');

 do $$
  declare
    u record;
    uid uuid;
    auth_instance_id uuid;
  begin
    select id into auth_instance_id from auth.instances limit 1;
    if auth_instance_id is null then
      auth_instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
    end if;

    for u in select * from temp_seed_users loop
      select au.id into uid
      from auth.users au
      where au.email = u.email;

      if uid is null then
        uid := gen_random_uuid();

        insert into auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
          created_at, updated_at
        )
        values (
          auth_instance_id,
          uid,
          'authenticated',
          'authenticated',
          u.email,
          crypt('password123', gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object(
            'full_name', u.full_name,
            'role', 'operator',
            'facility_code', u.facility_code
          ),
          now(),
          now()
        );

        insert into auth.identities (
          id, user_id, identity_data, provider, provider_id,
          created_at, updated_at
        )
        values (
          gen_random_uuid(),
          uid,
          jsonb_build_object('sub', uid::text, 'email', u.email),
          'email',
          u.email,
          now(),
          now()
        );
      end if;
    end loop;
  end $$;

update public.users pu
set
  role = tsu.role,
  facility_id = tsu.facility_id,
  full_name = tsu.full_name
from temp_seed_users tsu
where pu.email = tsu.email;

-- 3) Equipment (4 per facility = 20 total)
insert into public.equipment (facility_id, name, equipment_type, serial_number, status)
select
  f.id,
  'EQ-' || right(f.code, 4) || '-' || lpad(gs::text, 2, '0'),
  case gs % 4
    when 0 then 'Compressor'
    when 1 then 'Pump'
    when 2 then 'Boiler'
    else 'Conveyor'
  end,
  'SN-' || replace(f.code, '-', '') || '-' || lpad(gs::text, 4, '0'),
  case
    when gs = 4 then 'maintenance'::public.equipment_status
    when gs = 3 then 'offline'::public.equipment_status
    else 'online'::public.equipment_status
  end
from public.facilities f
cross join generate_series(1, 4) as gs
where f.code in ('FAC-NORTH', 'FAC-SOUTH', 'FAC-EAST', 'FAC-WEST', 'FAC-CENTRAL')
on conflict (serial_number) do update
set
  facility_id = excluded.facility_id,
  name = excluded.name,
  equipment_type = excluded.equipment_type,
  status = excluded.status;

-- 4) Sensors (temperature, vibration, pressure per equipment)
insert into public.sensors (facility_id, equipment_id, sensor_type, unit)
select
  e.facility_id,
  e.id,
  s.sensor_type,
  s.unit
from public.equipment e
cross join (
  values
    ('temperature', 'C'),
    ('vibration', 'mm/s'),
    ('pressure', 'psi')
) as s(sensor_type, unit)
where e.serial_number like 'SN-FAC%'
  and not exists (
    select 1 from public.sensors existing
    where existing.equipment_id = e.id
      and existing.sensor_type = s.sensor_type
  );

-- 5) Sensor readings (48 points per sensor, only if sensor has no readings yet)
insert into public.sensor_readings (facility_id, equipment_id, sensor_id, reading_value, recorded_at)
select
  s.facility_id,
  s.equipment_id,
  s.id,
  case
    when s.sensor_type = 'temperature' then round((58 + random() * 42)::numeric, 2)
    when s.sensor_type = 'vibration' then round((2 + random() * 16)::numeric, 2)
    else round((85 + random() * 70)::numeric, 2)
  end,
  now() - ((g.n * 15) || ' minutes')::interval
from public.sensors s
cross join generate_series(1, 48) as g(n)
where exists (select 1 from public.equipment e where e.id = s.equipment_id and e.serial_number like 'SN-FAC%')
  and not exists (select 1 from public.sensor_readings sr where sr.sensor_id = s.id);

-- 6) Maintenance schedules
insert into public.maintenance_schedules (facility_id, equipment_id, cadence_days, next_due_at, is_active, title)
select
  e.facility_id,
  e.id,
  case when e.equipment_type in ('Boiler', 'Compressor') then 14 else 30 end,
  now() + (case when e.status = 'maintenance' then 2 else 10 end) * interval '1 day',
  true,
  'Preventive - ' || e.name
from public.equipment e
where e.serial_number like 'SN-FAC%'
  and not exists (
    select 1 from public.maintenance_schedules ms
    where ms.equipment_id = e.id
      and ms.title = 'Preventive - ' || e.name
  );

-- 7) Work orders with lifecycle states
insert into public.work_orders (
  facility_id, equipment_id, maintenance_schedule_id, title, status, priority,
  due_date, assigned_to, completed_at, completion_notes
)
with schedule_base as (
  select
    ms.id as maintenance_schedule_id,
    ms.facility_id,
    ms.equipment_id,
    ms.title,
    row_number() over (partition by ms.facility_id order by ms.created_at, ms.id) as rn
  from public.maintenance_schedules ms
  where ms.title like 'Preventive - EQ-%'
),
tech_users as (
    select distinct on (facility_id)
      facility_id,
      id as technician_id
    from public.users
    where role = 'technician'
    order by facility_id, created_at asc, id asc
)
select
  sb.facility_id,
  sb.equipment_id,
  sb.maintenance_schedule_id,
  'WO - ' || sb.title,
  case sb.rn % 4
    when 0 then 'open'::public.work_order_status
    when 1 then 'assigned'::public.work_order_status
    when 2 then 'in_progress'::public.work_order_status
    else 'completed'::public.work_order_status
  end,
  case sb.rn % 3
    when 0 then 'critical'::public.alert_severity
    when 1 then 'high'::public.alert_severity
    else 'medium'::public.alert_severity
  end,
  now() + ((sb.rn % 6) + 1) * interval '1 day',
  case when sb.rn % 4 in (1, 2, 3) then tu.technician_id else null end,
  case when sb.rn % 4 = 3 then now() - interval '1 day' else null end,
  case when sb.rn % 4 = 3 then 'Completed in seeded workflow.' else null end
from schedule_base sb
left join tech_users tu on tu.facility_id = sb.facility_id
where not exists (
  select 1 from public.work_orders wo
  where wo.maintenance_schedule_id = sb.maintenance_schedule_id
    and wo.title = 'WO - ' || sb.title
);

-- 8) Maintenance history from completed work orders
insert into public.maintenance_history (facility_id, equipment_id, work_order_id, summary, performed_at)
select
  wo.facility_id,
  wo.equipment_id,
  wo.id,
  'Maintenance completed for ' || e.name,
  coalesce(wo.completed_at, now() - interval '2 days')
from public.work_orders wo
join public.equipment e on e.id = wo.equipment_id
where wo.status = 'completed'
  and wo.title like 'WO - Preventive - EQ-%'
  and not exists (
    select 1 from public.maintenance_history mh
    where mh.work_order_id = wo.id
  );

-- 9) Alerts (with acknowledged samples)
insert into public.alerts (facility_id, equipment_id, title, message, severity, is_resolved, acknowledged_at, acknowledged_by)
with ranked_equipment as (
  select
    e.*,
    row_number() over (partition by e.facility_id order by e.created_at, e.id) as rn
  from public.equipment e
  where e.serial_number like 'SN-FAC%'
),
manager_users as (
    select distinct on (facility_id)
      facility_id,
      id as manager_id
    from public.users
    where role = 'manager'
    order by facility_id, created_at asc, id asc
)
select
  re.facility_id,
  re.id,
  'Sensor threshold anomaly',
  'Seeded anomaly detected on ' || re.name,
  case re.rn
    when 1 then 'medium'::public.alert_severity
    when 2 then 'high'::public.alert_severity
    else 'critical'::public.alert_severity
  end,
  re.rn = 1,
  case when re.rn in (1, 2) then now() - interval '3 hours' else null end,
  case when re.rn in (1, 2) then mu.manager_id else null end
from ranked_equipment re
left join manager_users mu on mu.facility_id = re.facility_id
where re.rn <= 3
  and not exists (
    select 1 from public.alerts a
    where a.equipment_id = re.id
      and a.title = 'Sensor threshold anomaly'
  );

-- 10) Health scores
insert into public.equipment_health_scores (facility_id, equipment_id, score, model_version, calculated_at)
select
  e.facility_id,
  e.id,
  round((65 + random() * 32)::numeric, 2),
  'v1-threshold-rolling',
  now() - interval '30 minutes'
from public.equipment e
where e.serial_number like 'SN-FAC%'
  and not exists (
    select 1 from public.equipment_health_scores hs
    where hs.equipment_id = e.id
  );

-- 11) Downtime events (recent incidents)
insert into public.downtime_events (facility_id, equipment_id, started_at, ended_at, reason, start_time, end_time, cause)
with candidates as (
  select
    e.*,
    row_number() over (partition by e.facility_id order by e.created_at, e.id) as rn
  from public.equipment e
  where e.serial_number like 'SN-FAC%'
)
select
  c.facility_id,
  c.id,
  now() - interval '2 days',
  now() - interval '1 day 20 hours',
  'Scheduled maintenance pause',
  now() - interval '2 days',
  now() - interval '1 day 20 hours',
  'Scheduled maintenance pause'
from candidates c
where c.rn = 4
  and not exists (
    select 1 from public.downtime_events de
    where de.equipment_id = c.id
  );

commit;
