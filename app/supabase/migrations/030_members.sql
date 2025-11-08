-- ==========================================================
-- 🔹 ENUM: visitor_followup_status
-- ==========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'visitor_followup_status') then
    create type visitor_followup_status as enum ('pendente', 'em_andamento', 'concluido');
  end if;
end$$;

-- ==========================================================
-- 🔹 TABELA: VISITORS (Isolamento total por igreja)
-- ==========================================================
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visit_date date not null,
  followup_status visitor_followup_status default 'pendente',
  phone text,
  email text,
  notes text,
  is_member boolean default false,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (church_id, name, visit_date)
);

create index if not exists idx_visitors_church_id on public.visitors(church_id);

-- ==========================================================
-- 🔹 TRIGGERS
-- ==========================================================
drop trigger if exists trg_visitors_updated_at on public.visitors;
create trigger trg_visitors_updated_at
before update on public.visitors
for each row
execute function public.set_updated_at();

drop trigger if exists trg_visitors_church_id on public.visitors;
create trigger trg_visitors_church_id
before insert on public.visitors
for each row
execute function public.set_church_id();

-- ==========================================================
-- 🔹 RLS (Isolamento entre igrejas)
-- ==========================================================
alter table public.visitors enable row level security;
alter table public.visitors force row level security;

-- Remove políticas antigas
drop policy if exists "visitors_rls" on public.visitors;
drop policy if exists "Allow read visitors for all users" on public.visitors;
drop policy if exists "Allow insert visitors for all users" on public.visitors;
drop policy if exists "Allow update visitors for all users" on public.visitors;

drop policy if exists "select_visitors_by_church" on public.visitors;
drop policy if exists "insert_visitors_by_church" on public.visitors;
drop policy if exists "update_visitors_by_church" on public.visitors;
drop policy if exists "delete_visitors_by_church" on public.visitors;

-- 🔸 SELECT — apenas registros da igreja do JWT
create policy "select_visitors_by_church"
on public.visitors
for select
to authenticated
using (church_id = public.current_church_id());

-- 🔸 INSERT — força uso do church_id da sessão
create policy "insert_visitors_by_church"
on public.visitors
for insert
to authenticated
with check (church_id = public.current_church_id());

-- 🔸 UPDATE — só edita registros da própria igreja
create policy "update_visitors_by_church"
on public.visitors
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

-- 🔸 DELETE — só remove registros da própria igreja
create policy "delete_visitors_by_church"
on public.visitors
for delete
to authenticated
using (church_id = public.current_church_id());

-- ==========================================================
-- 🔹 PERMISSÕES
-- ==========================================================
revoke all on public.visitors from anon;
grant select, insert, update, delete on public.visitors to authenticated;

-- ==========================================================
-- 🔹 RELOAD DO SCHEMA
-- ==========================================================
notify pgrst, 'reload schema';
