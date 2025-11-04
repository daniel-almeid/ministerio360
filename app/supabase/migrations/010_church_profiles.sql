create table if not exists public.church_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_church_profiles_user_id
  on public.church_profiles (user_id);

drop trigger if exists trg_church_profiles_updated_at on public.church_profiles;
create trigger trg_church_profiles_updated_at
before update on public.church_profiles
for each row execute function public.set_updated_at();

alter table public.church_profiles enable row level security;

drop policy if exists "select_own_church_profile" on public.church_profiles;
create policy "select_own_church_profile"
on public.church_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "update_own_church_profile" on public.church_profiles;
create policy "update_own_church_profile"
on public.church_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.church_profiles to authenticated;
revoke all on public.church_profiles from anon;

-- (Opcional) Criação automática do profile no sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.church_profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'church_name', 'Igreja sem nome'));
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

notify pgrst, 'reload schema';
