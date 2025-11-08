-- ==========================================================
-- 🔹 TABELA: SCALES (Isolamento total por igreja)
-- ==========================================================
create table if not exists public.scales (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  date date not null,
  responsible text,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_scales_church_id
on public.scales(church_id);

-- ==========================================================
-- 🔹 TRIGGERS
-- ==========================================================
drop trigger if exists trg_scales_updated_at on public.scales;
create trigger trg_scales_updated_at
before update on public.scales
for each row
execute function public.set_updated_at();

drop trigger if exists trg_scales_church_id on public.scales;
create trigger trg_scales_church_id
before insert on public.scales
for each row
execute function public.set_church_id();

-- ==========================================================
-- 🔹 RLS (Isolamento entre igrejas)
-- ==========================================================
alter table public.scales enable row level security;
alter table public.scales force row level security;

-- ==========================================================
-- 🔹 LIMPEZA COMPLETA DE POLÍTICAS ANTIGAS
-- ==========================================================
drop policy if exists "scales_rls" on public.scales;
drop policy if exists "Allow read for all" on public.scales;
drop policy if exists "Allow insert for all" on public.scales;
drop policy if exists "Allow update for all" on public.scales;
drop policy if exists "Allow delete for all" on public.scales;

drop policy if exists "anon_select_scales" on public.scales;
drop policy if exists "anon_insert_scales" on public.scales;
drop policy if exists "anon_update_scales" on public.scales;
drop policy if exists "anon_delete_scales" on public.scales;

drop policy if exists "auth_select_scales" on public.scales;
drop policy if exists "auth_insert_scales" on public.scales;
drop policy if exists "auth_update_scales" on public.scales;
drop policy if exists "auth_delete_scales" on public.scales;

drop policy if exists "select_scales_by_church" on public.scales;
drop policy if exists "insert_scales_by_church" on public.scales;
drop policy if exists "update_scales_by_church" on public.scales;
drop policy if exists "delete_scales_by_church" on public.scales;

drop policy if exists "scales_select_all" on public.scales;
drop policy if exists "scales_ins_all" on public.scales;

-- ==========================================================
-- 🔹 POLÍTICAS CORRETAS E FINAIS
-- ==========================================================
create policy "select_scales_by_church"
on public.scales
for select
to authenticated
using (church_id = public.current_church_id());

create policy "insert_scales_by_church"
on public.scales
for insert
to authenticated
with check (church_id = public.current_church_id());

create policy "update_scales_by_church"
on public.scales
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

create policy "delete_scales_by_church"
on public.scales
for delete
to authenticated
using (church_id = public.current_church_id());

-- ==========================================================
-- 🔹 PERMISSÕES E RELOAD
-- ==========================================================
revoke all on public.scales from anon;
grant select, insert, update, delete on public.scales to authenticated;

notify pgrst, 'reload schema';
