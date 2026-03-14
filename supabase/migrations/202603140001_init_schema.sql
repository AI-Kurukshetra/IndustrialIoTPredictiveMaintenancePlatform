create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'manager', 'technician', 'operator');
create type public.alert_severity as enum ('low', 'medium', 'high', 'critical');
create type public.equipment_status as enum ('online', 'offline', 'maintenance', 'fault');
create type public.work_order_status as enum ('open', 'in_progress', 'completed', 'cancelled');

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  location text not null,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete restrict,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'operator',
  created_at timestamptz not null default now()
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  name text not null,
  equipment_type text not null,
  serial_number text not null unique,
  status public.equipment_status not null default 'online',
  created_at timestamptz not null default now()
);

create table public.sensors (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  sensor_type text not null check (sensor_type in ('temperature', 'vibration', 'pressure')),
  unit text not null,
  created_at timestamptz not null default now()
);

create table public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  sensor_id uuid not null references public.sensors(id) on delete cascade,
  reading_value numeric(10,2) not null,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  title text not null,
  message text not null,
  severity public.alert_severity not null default 'medium',
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  cadence_days int not null check (cadence_days > 0),
  next_due_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  maintenance_schedule_id uuid references public.maintenance_schedules(id) on delete set null,
  title text not null,
  status public.work_order_status not null default 'open',
  priority public.alert_severity not null default 'medium',
  due_date timestamptz,
  created_at timestamptz not null default now()
);

create table public.maintenance_history (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  work_order_id uuid references public.work_orders(id) on delete set null,
  summary text not null,
  performed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.equipment_health_scores (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  model_version text not null,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.downtime_events (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_equipment_facility on public.equipment(facility_id);
create index idx_sensors_equipment on public.sensors(equipment_id);
create index idx_sensor_readings_sensor_time on public.sensor_readings(sensor_id, recorded_at desc);
create index idx_alerts_facility_resolved on public.alerts(facility_id, is_resolved);
create index idx_health_scores_equipment_time on public.equipment_health_scores(equipment_id, calculated_at desc);

create or replace function public.current_user_facility_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select facility_id from public.users where id = auth.uid();
$$;

revoke all on function public.current_user_facility_id() from public;
grant execute on function public.current_user_facility_id() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, facility_id, email, full_name, role)
  values (
    new.id,
    (select id from public.facilities order by created_at asc limit 1),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'operator')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.facilities enable row level security;
alter table public.users enable row level security;
alter table public.equipment enable row level security;
alter table public.sensors enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.alerts enable row level security;
alter table public.maintenance_schedules enable row level security;
alter table public.work_orders enable row level security;
alter table public.maintenance_history enable row level security;
alter table public.equipment_health_scores enable row level security;
alter table public.downtime_events enable row level security;

create policy "facilities_select_own" on public.facilities
for select using (id = public.current_user_facility_id());

create policy "users_select_own_facility" on public.users
for select using (facility_id = public.current_user_facility_id());

create policy "users_update_self" on public.users
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "facility_scoped_equipment" on public.equipment
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_sensors" on public.sensors
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_sensor_readings" on public.sensor_readings
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_alerts" on public.alerts
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_maintenance_schedules" on public.maintenance_schedules
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_work_orders" on public.work_orders
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_maintenance_history" on public.maintenance_history
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_health_scores" on public.equipment_health_scores
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

create policy "facility_scoped_downtime" on public.downtime_events
for all using (facility_id = public.current_user_facility_id())
with check (facility_id = public.current_user_facility_id());

alter publication supabase_realtime add table public.sensor_readings;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.equipment_health_scores;
