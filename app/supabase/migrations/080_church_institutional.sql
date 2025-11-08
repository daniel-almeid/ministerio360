-- ==========================================================
-- TABELA: CHURCH_INSTITUTIONAL_INFO (UNIFICADA)
-- ==========================================================

-- Remove versões antigas para recriar do zero
drop table if exists public.church_address_contact cascade;
drop table if exists public.church_institutional_info cascade;

-- Criação da nova tabela unificada
create table if not exists public.church_institutional_info (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.church_profiles(id) on delete cascade,

  -- INFORMAÇÕES INSTITUCIONAIS
  corporate_name text,            -- Razão social
  trade_name text,                -- Nome fantasia
  cnpj text,                      -- CNPJ
  foundation_date date,           -- Data de fundação
  status text check (status in ('Ativa', 'Inativa')),
  denomination text,              -- Denominação / cobertura ministerial
  purpose text,                   -- Propósito ou lema institucional

  -- ENDEREÇO E CONTATO
  address text,                   -- Endereço completo
  phone text,                     -- Telefone / WhatsApp
  email text,                     -- E-mail institucional
  website text,                   -- Site oficial
  social_media text,              -- Redes sociais (links ou handles)

  -- METADADOS
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- CONSTRAINT: cada igreja só pode ter um registro
  constraint church_institutional_info_church_id_unique unique (church_id)
);

-- Índice auxiliar para melhorar performance de consultas por church_id
create index if not exists idx_church_institutional_info_church_id
on public.church_institutional_info (church_id);

-- ==========================================================
-- TRIGGER: atualiza automaticamente o campo updated_at
-- ==========================================================
drop trigger if exists trg_church_institutional_info_updated_at on public.church_institutional_info;
create trigger trg_church_institutional_info_updated_at
before update on public.church_institutional_info
for each row
execute function public.set_updated_at();

-- ==========================================================
-- RLS: cada igreja só acessa seus próprios dados
-- ==========================================================
alter table public.church_institutional_info enable row level security;

drop policy if exists "institutional_info_rls" on public.church_institutional_info;
create policy "institutional_info_rls"
on public.church_institutional_info
for all
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

grant select, insert, update, delete on public.church_institutional_info to authenticated;
revoke all on public.church_institutional_info from anon;

-- ==========================================================
-- RELOAD DO SCHEMA
-- ==========================================================
notify pgrst, 'reload schema';

-- ==========================================================
-- VERIFICAR AS COLUNAS
-- ==========================================================
select column_name
from information_schema.columns
where table_name = 'church_institutional_info'
order by ordinal_position;
