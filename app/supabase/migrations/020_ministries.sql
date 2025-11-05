create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (church_id, name)
);

create index if not exists idx_ministries_church_id on public.ministries(church_id);

drop trigger if exists trg_ministries_updated_at on public.ministries;
create trigger trg_ministries_updated_at
before update on public.ministries
for each row execute function public.set_updated_at();

drop trigger if exists trg_ministries_church_id on public.ministries;
create trigger trg_ministries_church_id
before insert on public.ministries
for each row execute function public.set_church_id();

alter table public.ministries enable row level security;

drop policy if exists "ministries_rls" on public.ministries;
create policy "ministries_rls"
on public.ministries
for all to authenticated
using (church_id = (auth.jwt() ->> 'church_id')::uuid)
with check (church_id = (auth.jwt() ->> 'church_id')::uuid);

grant all on public.ministries to authenticated;
revoke all on public.ministries from anon;
