-- ==========================================================
-- 🔹 TABELA: EVENTS (Isolamento total por igreja)
-- ==========================================================
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

create index if not exists idx_events_church_id
on public.events(church_id);

-- ==========================================================
-- 🔹 TRIGGERS
-- ==========================================================
drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

drop trigger if exists trg_events_church_id on public.events;
create trigger trg_events_church_id
before insert on public.events
for each row
execute function public.set_church_id();

-- ==========================================================
-- 🔹 RLS + LIMPEZA TOTAL DE POLÍTICAS ANTIGAS
-- ==========================================================
alter table public.events enable row level security;
alter table public.events force row level security;

-- 🔸 Remove todas as políticas antigas
drop policy if exists "events_rls" on public.events;
drop policy if exists "Allow read for all" on public.events;
drop policy if exists "Allow insert for all" on public.events;
drop policy if exists "Allow update for all" on public.events;
drop policy if exists "Allow delete for all" on public.events;

drop policy if exists "anon_select_events" on public.events;
drop policy if exists "anon_insert_events" on public.events;
drop policy if exists "anon_update_events" on public.events;
drop policy if exists "anon_delete_events" on public.events;

drop policy if exists "auth_select_events" on public.events;
drop policy if exists "auth_insert_events" on public.events;
drop policy if exists "auth_update_events" on public.events;
drop policy if exists "auth_delete_events" on public.events;

drop policy if exists "select_events_by_church" on public.events;
drop policy if exists "insert_events_by_church" on public.events;
drop policy if exists "update_events_by_church" on public.events;
drop policy if exists "delete_events_by_church" on public.events;

-- ==========================================================
-- 🔹 POLÍTICAS DEFINITIVAS (MULTI-IGREJA)
-- ==========================================================

-- SELECT — apenas registros da igreja atual
create policy "select_events_by_church"
on public.events
for select
to authenticated
using (church_id = public.current_church_id());

-- INSERT — restringe ao church_id do JWT
create policy "insert_events_by_church"
on public.events
for insert
to authenticated
with check (church_id = public.current_church_id());

-- UPDATE — apenas registros da própria igreja
create policy "update_events_by_church"
on public.events
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

-- DELETE — idem
create policy "delete_events_by_church"
on public.events
for delete
to authenticated
using (church_id = public.current_church_id());

-- ==========================================================
-- 🔹 PERMISSÕES E RELOAD
-- ==========================================================
revoke all on public.events from anon;
grant select, insert, update, delete on public.events to authenticated;

notify pgrst, 'reload schema';
