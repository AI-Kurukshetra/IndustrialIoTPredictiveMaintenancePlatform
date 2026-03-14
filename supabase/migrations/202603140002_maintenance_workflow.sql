do $$
begin
  alter type public.work_order_status add value if not exists 'assigned';
exception
  when duplicate_object then null;
end;
$$;

alter table public.work_orders
  add column if not exists assigned_to uuid references public.users(id) on delete set null,
  add column if not exists completed_at timestamptz,
  add column if not exists completion_notes text;

create index if not exists idx_work_orders_facility_status on public.work_orders(facility_id, status);
create index if not exists idx_work_orders_assigned_to on public.work_orders(assigned_to);

alter table public.maintenance_schedules
  add column if not exists is_active boolean not null default true,
  add column if not exists title text;
