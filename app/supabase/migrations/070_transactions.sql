-- =====================================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================================
create extension if not exists "pgcrypto";

-- =====================================================
-- FUNÇÃO CENTRAL: Retorna o church_id do usuário atual
-- =====================================================
create or replace function public.current_church_id()
returns uuid
language sql
stable
set search_path = public
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.church_id', true), '')::uuid,
    (
      select id
      from public.church_profiles
      where user_id = auth.uid()
      limit 1
    )
  );
$$;

grant execute on function public.current_church_id() to authenticated;

-- =====================================================
-- FUNÇÃO: Atualiza automaticamente o campo updated_at
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = tg_table_name
    and column_name = 'updated_at'
  ) then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

grant execute on function public.set_updated_at() to authenticated;

-- =====================================================
-- TABELA: CHURCH_PROFILES
-- =====================================================
create table if not exists public.church_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_church_profiles_user_id on public.church_profiles (user_id);

-- TRIGGER: Atualiza automaticamente o campo updated_at
drop trigger if exists trg_church_profiles_updated_at on public.church_profiles;
create trigger trg_church_profiles_updated_at
before update on public.church_profiles
for each row execute function public.set_updated_at();

-- =====================================================
-- RLS: Cada usuário só acessa sua própria igreja
-- =====================================================
alter table public.church_profiles enable row level security;
alter table public.church_profiles force row level security;

drop policy if exists "select_own_church_profile" on public.church_profiles;
create policy "select_own_church_profile"
on public.church_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "update_own_church_profile" on public.church_profiles;
create policy "update_own_church_profile"
on public.church_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on public.church_profiles from anon;
grant select, insert, update, delete on public.church_profiles to authenticated;

-- =====================================================
-- FUNÇÃO: Atualiza o claim church_id no JWT
-- =====================================================
create or replace function public.refresh_church_claim(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_church_id uuid;
begin
  select id into v_church_id
  from public.church_profiles
  where user_id = p_user_id;

  if v_church_id is null then
    raise notice 'Usuario % não possui church_profile', p_user_id;
    return json_build_object('status', 'error', 'message', 'church_profile não encontrado');
  end if;

  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{church_id}',
    to_jsonb(v_church_id)
  )
  where id = p_user_id;

  raise notice 'Claim church_id atualizado: % -> %', p_user_id, v_church_id;
  return json_build_object('status', 'success', 'church_id', v_church_id);
end;
$$;

grant execute on function public.refresh_church_claim(uuid) to authenticated;

-- =====================================================
-- FUNÇÃO: Cria automaticamente um perfil ao registrar usuário
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_church_id uuid;
begin
  insert into public.church_profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'church_name', 'Igreja sem nome'))
  returning id into v_church_id;

  perform public.refresh_church_claim(new.id);

  raise notice 'Novo usuário %, igreja criada %', new.id, v_church_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =====================================================
-- TABELA: TRANSACTIONS
-- =====================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('entrada', 'saida')),
  category text,
  person_name text,
  amount numeric(12,2) not null check (amount >= 0),
  note text,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_church_id on public.transactions(church_id);

-- =====================================================
-- FUNÇÃO: Define automaticamente o church_id na inserção
-- =====================================================
create or replace function public.set_transaction_church_id()
returns trigger
language plpgsql
as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não foi possível definir o church_id ao inserir transação.';
  end if;
  return new;
end;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================
drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_transactions_church_id on public.transactions;
create trigger trg_transactions_church_id
before insert on public.transactions
for each row execute function public.set_transaction_church_id();

-- =====================================================
-- RLS — Isolamento total por igreja
-- =====================================================
alter table public.transactions enable row level security;
alter table public.transactions force row level security;

drop policy if exists "select_transactions_by_church" on public.transactions;
drop policy if exists "insert_transactions_by_church" on public.transactions;
drop policy if exists "update_transactions_by_church" on public.transactions;
drop policy if exists "delete_transactions_by_church" on public.transactions;

-- SELECT — exibe apenas transações da igreja atual
create policy "select_transactions_by_church"
on public.transactions
for select
to authenticated
using (church_id = public.current_church_id());

-- INSERT — permite inserir apenas na própria igreja
create policy "insert_transactions_by_church"
on public.transactions
for insert
to authenticated
with check (church_id = public.current_church_id());

-- UPDATE — permite editar apenas registros da própria igreja
create policy "update_transactions_by_church"
on public.transactions
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

-- DELETE — permite deletar registros da própria igreja
create policy "delete_transactions_by_church"
on public.transactions
for delete
to authenticated
using (church_id = public.current_church_id());

-- =====================================================
-- RECARREGA O SCHEMA DO SUPABASE
-- =====================================================
notify pgrst, 'reload schema';
