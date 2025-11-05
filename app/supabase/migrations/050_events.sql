create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date not null,
  time time,
  location text,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (church_id, title, date)
);

create index if not exists idx_events_church_id on public.events(church_id);

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists trg_events_church_id on public.events;
create trigger trg_events_church_id
before insert on public.events
for each row execute function public.set_church_id();

alter table public.events enable row level security;

drop policy if exists "events_rls" on public.events;
create policy "events_rls"
on public.events
for all to authenticated
using (church_id = (auth.jwt() ->> 'church_id')::uuid)
with check (church_id = (auth.jwt() ->> 'church_id')::uuid);

grant all on public.events to authenticated;
revoke all on public.events from anon;
