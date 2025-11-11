-- ==========================================================
-- TABELA: MEMBERS (Isolamento completo por igreja)
-- ==========================================================
drop table if exists public.members cascade;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  birth_date date,
  is_active boolean not null default true,
  ministry_id uuid references public.ministries(id) on delete set null,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, name)
);

create index if not exists idx_members_church_id
on public.members(church_id);

create index if not exists idx_members_ministry_id
on public.members(ministry_id);

-- ==========================================================
-- FUNÇÃO: Define automaticamente o church_id na inserção
-- ==========================================================
create or replace function public.set_member_church_id()
returns trigger
language plpgsql
as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;

  if new.church_id is null then
    raise exception 'Não foi possível definir o church_id ao inserir membro.';
  end if;

  return new;
end;
$$;

grant execute on function public.set_member_church_id() to authenticated;

-- ==========================================================
-- TRIGGERS
-- ==========================================================
drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

drop trigger if exists trg_members_church_id on public.members;
create trigger trg_members_church_id
before insert on public.members
for each row
execute function public.set_member_church_id();

-- ==========================================================
-- RLS (ISOLAMENTO ENTRE IGREJAS)
-- ==========================================================
alter table public.members enable row level security;
alter table public.members force row level security;

drop policy if exists "select_members_by_church" on public.members;
drop policy if exists "insert_members_by_church" on public.members;
drop policy if exists "update_members_by_church" on public.members;
drop policy if exists "delete_members_by_church" on public.members;

create policy "select_members_by_church"
on public.members
for select
to authenticated
using (church_id = public.current_church_id());

create policy "insert_members_by_church"
on public.members
for insert
to authenticated
with check (church_id = public.current_church_id());

create policy "update_members_by_church"
on public.members
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

create policy "delete_members_by_church"
on public.members
for delete
to authenticated
using (church_id = public.current_church_id());

-- ==========================================================
-- PERMISSÕES
-- ==========================================================
revoke all on public.members from anon;
grant select, insert, update, delete on public.members to authenticated;

-- ==========================================================
-- RELOAD DO SCHEMA
-- ==========================================================
notify pgrst, 'reload schema';
