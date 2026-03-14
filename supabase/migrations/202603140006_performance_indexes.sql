create index if not exists idx_sensor_readings_equipment_recorded_at on public.sensor_readings(equipment_id, recorded_at desc);
create index if not exists idx_work_orders_status_created_at on public.work_orders(status, created_at desc);
create index if not exists idx_maintenance_schedules_next_due_at on public.maintenance_schedules(next_due_at);
create index if not exists idx_alerts_is_resolved_created_at on public.alerts(is_resolved, created_at desc);
