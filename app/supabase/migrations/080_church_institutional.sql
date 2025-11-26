-- ==========================================================
-- TABELA: CHURCH_INSTITUTIONAL_INFO (UNIFICADA)
-- ==========================================================

drop table if exists public.church_address_contact cascade;
drop table if exists public.church_institutional_info cascade;

create table if not exists public.church_institutional_info (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.church_profiles(id) on delete cascade,

  corporate_name text,
  trade_name text,
  cnpj text,
  foundation_date date,
  status text check (status in ('Ativa', 'Inativa')),
  denomination text,
  purpose text,

  address text,
  phone text,
  email text,
  website text,
  social_media text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint church_institutional_info_church_id_unique unique (church_id)
);

create index if not exists idx_church_institutional_info_church_id
on public.church_institutional_info (church_id);

-- ==========================================================
-- TRIGGER: updated_at
-- ==========================================================

drop trigger if exists trg_church_institutional_info_updated_at 
on public.church_institutional_info;

create trigger trg_church_institutional_info_updated_at
before update on public.church_institutional_info
for each row
execute function public.set_updated_at();

-- ==========================================================
-- SYNC trade_name → church_profiles.trade_name
-- ==========================================================

create or replace function public.sync_church_trade_name()
returns trigger
language plpgsql
as $$
begin
  if new.trade_name is not null and btrim(new.trade_name) <> '' then
    update public.church_profiles
    set trade_name = new.trade_name
    where id = new.church_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_church_trade_name 
on public.church_institutional_info;

create trigger trg_sync_church_trade_name
after insert or update on public.church_institutional_info
for each row
execute function public.sync_church_trade_name();

-- BACKFILL: copiar Nome Fantasia já existente para church_profiles
update public.church_profiles c
set trade_name = i.trade_name
from public.church_institutional_info i
where i.church_id = c.id
  and i.trade_name is not null
  and btrim(i.trade_name) <> '';


-- ==========================================================
-- RLS CONFIGURAÇÃO
-- ==========================================================

alter table public.church_institutional_info enable row level security;

-- Remover políticas antigas
drop policy if exists church_institutional_info_select on public.church_institutional_info;
drop policy if exists church_institutional_info_insert on public.church_institutional_info;
drop policy if exists church_institutional_info_update on public.church_institutional_info;
drop policy if exists church_institutional_info_delete on public.church_institutional_info;

-- SELECT
create policy church_institutional_info_select
on public.church_institutional_info
for select
to authenticated
using (church_id = public.current_church_id());

-- INSERT
create policy church_institutional_info_insert
on public.church_institutional_info
for insert
to authenticated
with check (church_id = public.current_church_id());

-- UPDATE
create policy church_institutional_info_update
on public.church_institutional_info
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

-- DELETE
create policy church_institutional_info_delete
on public.church_institutional_info
for delete
to authenticated
using (church_id = public.current_church_id());

-- ==========================================================
-- PERMISSÕES
-- ==========================================================

grant select, insert, update, delete
on public.church_institutional_info
to authenticated;

revoke all on public.church_institutional_info from anon;

-- ==========================================================
-- RELOAD DO SCHEMA
-- ==========================================================

notify pgrst, 'reload schema';
