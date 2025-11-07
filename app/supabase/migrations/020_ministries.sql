-- ==========================================================
-- 🔹 TABELA: MINISTRIES (Isolamento completo por igreja)
-- ==========================================================
create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, name)
);

create index if not exists idx_ministries_church_id
on public.ministries(church_id);

-- ==========================================================
-- 🔹 FUNÇÃO: Define automaticamente o church_id na inserção
-- ==========================================================
create or replace function public.set_ministry_church_id()
returns trigger
language plpgsql
as $$
begin
  -- Define o church_id com base no JWT
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;

  -- Garante que o church_id foi definido corretamente
  if new.church_id is null then
    raise exception '❌ Não foi possível definir o church_id ao inserir ministério.';
  end if;

  return new;
end;
$$;

grant execute on function public.set_ministry_church_id() to authenticated;

-- ==========================================================
-- 🔹 TRIGGERS
-- ==========================================================
-- Atualiza automaticamente o campo updated_at
drop trigger if exists trg_ministries_updated_at on public.ministries;
create trigger trg_ministries_updated_at
before update on public.ministries
for each row
execute function public.set_updated_at();

-- Define automaticamente o church_id antes de inserir
drop trigger if exists trg_ministries_church_id on public.ministries;
create trigger trg_ministries_church_id
before insert on public.ministries
for each row
execute function public.set_ministry_church_id();

-- ==========================================================
-- 🔹 RLS SEGURO (ISOLAMENTO ENTRE IGREJAS)
-- ==========================================================
alter table public.ministries enable row level security;
alter table public.ministries force row level security;

-- Remove políticas antigas (caso existam)
drop policy if exists "select_ministries_by_church" on public.ministries;
drop policy if exists "insert_ministries_by_church" on public.ministries;
drop policy if exists "update_ministries_by_church" on public.ministries;
drop policy if exists "delete_ministries_by_church" on public.ministries;

-- 🔸 SELECT — Apenas registros da igreja do JWT
create policy "select_ministries_by_church"
on public.ministries
for select
to authenticated
using (church_id = public.current_church_id());

-- 🔸 INSERT — Força uso do church_id da sessão
create policy "insert_ministries_by_church"
on public.ministries
for insert
to authenticated
with check (church_id = public.current_church_id());

-- 🔸 UPDATE — Só edita registros da própria igreja
create policy "update_ministries_by_church"
on public.ministries
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

-- 🔸 DELETE — Só remove registros da própria igreja
create policy "delete_ministries_by_church"
on public.ministries
for delete
to authenticated
using (church_id = public.current_church_id());

-- ==========================================================
-- 🔹 PERMISSÕES
-- ==========================================================
revoke all on public.ministries from anon;
grant select, insert, update, delete on public.ministries to authenticated;

-- ==========================================================
-- 🔹 RELOAD DO SCHEMA
-- ==========================================================
notify pgrst, 'reload schema';
