create or replace function public.current_church_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'church_id', '')::uuid,
    (
      select id
      from public.church_profiles
      where user_id = auth.uid()
      limit 1
    )
  );
$$;

grant execute on function public.current_church_id() to authenticated;

create or replace function public.refresh_plan_claim(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_plan_slug text;
begin
  select plan_slug into v_plan_slug
  from public.church_profiles
  where user_id = p_user_id;

  if v_plan_slug is null then
    return json_build_object('status', 'error', 'message', 'plan_slug não encontrado');
  end if;

  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{plan_slug}',
    to_jsonb(v_plan_slug)
  )
  where id = p_user_id;

  return json_build_object('status', 'success', 'plan_slug', v_plan_slug);
end;
$$;

grant execute on function public.refresh_plan_claim(uuid) to authenticated;

create or replace function public.refresh_church_claim(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_church_id uuid;
  v_plan_slug text;
begin
  select id, plan_slug
  into v_church_id, v_plan_slug
  from public.church_profiles
  where user_id = p_user_id;

  if v_church_id is null then
    return json_build_object('status', 'error', 'message', 'church_profile não encontrado');
  end if;

  update auth.users
  set raw_app_meta_data = raw_app_meta_data
    || jsonb_build_object('church_id', v_church_id)
    || jsonb_build_object('plan_slug', v_plan_slug)
  where id = p_user_id;

  return json_build_object('status', 'success', 'church_id', v_church_id, 'plan_slug', v_plan_slug);
end;
$$;

grant execute on function public.refresh_church_claim(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_church_id uuid;
begin
  insert into public.church_profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'church_name', 'Igreja sem nome'))
  returning id into v_church_id;

  perform public.refresh_church_claim(new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
