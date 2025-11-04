-- Tabela principal
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date not null,
  time time not null,
  location text,
  church_id uuid references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, title, date)
);

create index if not exists idx_events_church_id on public.events (church_id);

drop trigger if exists trg_events_set_updated_at on public.events;
create trigger trg_events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- Preenche church_id em events
create or replace function public.set_event_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não é possível inserir evento sem church_id.';
  end if;
  return new;
end$$;

drop trigger if exists trg_events_church_id on public.events;
create trigger trg_events_church_id
before insert on public.events
for each row execute function public.set_event_church_id();

-- Tabela de relacionamento
create table if not exists public.event_ministries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ministry_id uuid not null references public.ministries(id) on delete cascade,
  church_id uuid references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, event_id, ministry_id)
);

create index if not exists idx_event_ministries_church_id on public.event_ministries (church_id);

drop trigger if exists trg_event_ministries_set_updated_at on public.event_ministries;
create trigger trg_event_ministries_set_updated_at
before update on public.event_ministries
for each row execute function public.set_updated_at();

-- Herda church_id do evento
create or replace function public.set_event_ministry_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    select church_id into new.church_id
    from public.events where id = new.event_id;
  end if;
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não foi possível definir church_id em event_ministries.';
  end if;
  return new;
end$$;

drop trigger if exists trg_event_ministry_church_id on public.event_ministries;
create trigger trg_event_ministry_church_id
before insert on public.event_ministries
for each row execute function public.set_event_ministry_church_id();

-- RLS
alter table public.events enable row level security;
alter table public.event_ministries enable row level security;

-- events
drop policy if exists "select_events_by_church"  on public.events;
drop policy if exists "insert_events_by_church"  on public.events;
drop policy if exists "update_events_by_church"  on public.events;
drop policy if exists "delete_events_by_church"  on public.events;

create policy "select_events_by_church" on public.events
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "insert_events_by_church" on public.events
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "update_events_by_church" on public.events
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "delete_events_by_church" on public.events
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

-- event_ministries
drop policy if exists "select_event_ministries_by_church" on public.event_ministries;
drop policy if exists "insert_event_ministries_by_church" on public.event_ministries;
drop policy if exists "update_event_ministries_by_church" on public.event_ministries;
drop policy if exists "delete_event_ministries_by_church" on public.event_ministries;

create policy "select_event_ministries_by_church" on public.event_ministries
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "insert_event_ministries_by_church" on public.event_ministries
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "update_event_ministries_by_church" on public.event_ministries
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "delete_event_ministries_by_church" on public.event_ministries
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

revoke all on public.events from anon;
revoke all on public.event_ministries from anon;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.event_ministries to authenticated;

notify pgrst, 'reload schema';
