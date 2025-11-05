create table if not exists public.scales (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  date date not null,
  responsible text,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_scales_church_id on public.scales(church_id);

drop trigger if exists trg_scales_updated_at on public.scales;
create trigger trg_scales_updated_at
before update on public.scales
for each row execute function public.set_updated_at();

drop trigger if exists trg_scales_church_id on public.scales;
create trigger trg_scales_church_id
before insert on public.scales
for each row execute function public.set_church_id();

alter table public.scales enable row level security;

drop policy if exists "scales_rls" on public.scales;
create policy "scales_rls"
on public.scales
for all to authenticated
using (church_id = (auth.jwt() ->> 'church_id')::uuid)
with check (church_id = (auth.jwt() ->> 'church_id')::uuid);

grant all on public.scales to authenticated;
revoke all on public.scales from anon;
