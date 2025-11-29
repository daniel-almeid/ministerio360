create extension if not exists "pgcrypto";

-- ============================================================================
--  FUNÇÃO GLOBAL: set_updated_at()
--  Usada por triggers para atualizar updated_at automaticamente
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
--  TABELA PRINCIPAL: church_profiles
-- ============================================================================
create table if not exists public.church_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name text not null,
  trade_name text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  plan_slug text not null default 'free',
  subscription_active boolean not null default false,

  -- 🔥 CAMPOS NECESSÁRIOS PARA COBRANÇA MANUAL
  plan_expires_at timestamptz,
  next_renewal_reminder timestamptz,

  -- 🔥 CAMPOS DE CICLO (já existiam)
  current_period_end date,
  canceled_at timestamptz
);

-- Garantir que colunas existam (para bancos antigos)
alter table public.church_profiles add column if not exists trade_name text;
alter table public.church_profiles add column if not exists plan_expires_at timestamptz;
alter table public.church_profiles add column if not exists next_renewal_reminder timestamptz;
alter table public.church_profiles add column if not exists current_period_end date;
alter table public.church_profiles add column if not exists canceled_at timestamptz;

create index if not exists idx_church_profiles_user_id
on public.church_profiles (user_id);


-- Trigger para updated_at
drop trigger if exists trg_church_profiles_updated_at on public.church_profiles;

create trigger trg_church_profiles_updated_at
before update on public.church_profiles
for each row execute function public.set_updated_at();


-- ============================================================================
--  FK PARA TABELA plans
-- ============================================================================
alter table public.church_profiles
drop constraint if exists fk_church_profiles_plan_slug;

alter table public.church_profiles
add constraint fk_church_profiles_plan_slug
  foreign key (plan_slug)
  references public.plans(plan_slug)
  on update cascade
  on delete restrict;


-- ============================================================================
--  RLS
-- ============================================================================
alter table public.church_profiles enable row level security;

drop policy if exists select_own_church_profile on public.church_profiles;
drop policy if exists update_own_church_profile on public.church_profiles;
drop policy if exists insert_own_church_profile on public.church_profiles;
drop policy if exists select_church_admin_all on public.church_profiles;
drop policy if exists update_church_admin_all on public.church_profiles;


-- Usuário pode ver seus próprios dados
create policy select_own_church_profile
on public.church_profiles
for select
to authenticated
using (auth.uid() = user_id);

-- Usuário pode atualizar seus próprios dados
create policy update_own_church_profile
on public.church_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Usuário pode criar o próprio perfil
create policy insert_own_church_profile
on public.church_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

-- Admin master pode ver todos os perfis
create policy select_church_admin_all
on public.church_profiles
for select
to authenticated
using (auth.uid() = '289d49c4-8db0-49e2-b527-af90809f3be8');

-- Admin master pode atualizar todos os perfis
create policy update_church_admin_all
on public.church_profiles
for update
to authenticated
using (auth.uid() = '289d49c4-8db0-49e2-b527-af90809f3be8')
with check (auth.uid() = '289d49c4-8db0-49e2-b527-af90809f3be8');


-- Permissões
revoke all on public.church_profiles from anon;
grant select, insert, update, delete on public.church_profiles to authenticated;


-- ============================================================================
--  FUNÇÃO: current_church_id()
-- ============================================================================
create or replace function public.current_church_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'church_id', '')::uuid,
    (
      select id
      from public.church_profiles
      where user_id = auth.uid()
      limit 1
    )
  );
$$;

grant execute on function public.current_church_id() to authenticated;


-- ============================================================================
--  FUNÇÃO: refresh_church_claim()
-- ============================================================================
create or replace function public.refresh_church_claim(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_church_id uuid;
  v_plan_slug text;
  v_subscription_active boolean;
begin
  select id, plan_slug, subscription_active
  into v_church_id, v_plan_slug, v_subscription_active
  from public.church_profiles
  where user_id = p_user_id
  limit 1;

  update auth.users
  set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('church_id', v_church_id)
      || jsonb_build_object('plan_slug', v_plan_slug)
      || jsonb_build_object('subscription_active', v_subscription_active)
  where id = p_user_id;

  return json_build_object(
    'status', 'success',
    'church_id', v_church_id,
    'plan_slug', v_plan_slug,
    'subscription_active', v_subscription_active
  );
end;
$$;

grant execute on function public.refresh_church_claim(uuid) to authenticated;


-- ============================================================================
--  TRIGGER: Criar church_profile automaticamente no signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_plan_slug text := coalesce(new.raw_user_meta_data->>'plan_slug', 'free');
  v_church_id uuid;
  v_church_name text;
begin
  v_church_name := coalesce(new.raw_user_meta_data->>'church_name', 'Igreja sem nome');

  if not exists (select 1 from public.plans where plan_slug = v_plan_slug) then
    v_plan_slug := 'free';
  end if;

  insert into public.church_profiles (user_id, name, trade_name, plan_slug, subscription_active)
  values (
    new.id,
    v_church_name,
    v_church_name,
    v_plan_slug,
    false
  )
  returning id into v_church_id;

  perform public.refresh_church_claim(new.id);

  return new;
end;
$$;


drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ============================================================================
--  RELOAD PGRST
-- ============================================================================
notify pgrst, 'reload schema';
