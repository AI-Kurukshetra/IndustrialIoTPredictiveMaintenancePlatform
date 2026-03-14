create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
  provided_code text;
  provided_name text;
  provided_location text;
  selected_facility_id uuid;
begin
  selected_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'operator');
  provided_code := nullif(trim(new.raw_user_meta_data->>'facility_code'), '');
  provided_name := nullif(trim(new.raw_user_meta_data->>'facility_name'), '');
  provided_location := nullif(trim(new.raw_user_meta_data->>'facility_location'), '');

  if selected_role = 'admin' then
    if provided_code is null or provided_name is null or provided_location is null then
      raise exception 'Admin signup requires facility_name, facility_code, and facility_location';
    end if;

    insert into public.facilities (name, code, location)
    values (provided_name, provided_code, provided_location)
    returning id into selected_facility_id;
  else
    if provided_code is null then
      raise exception 'Facility code is required';
    end if;

    select id into selected_facility_id
    from public.facilities
    where code = provided_code
    limit 1;

    if selected_facility_id is null then
      raise exception 'Invalid facility code';
    end if;
  end if;

  insert into public.users (id, facility_id, email, full_name, role)
  values (
    new.id,
    selected_facility_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    selected_role
  )
  on conflict (id) do update set
    facility_id = excluded.facility_id,
    role = excluded.role,
    email = excluded.email;

  return new;
end;
$$;
