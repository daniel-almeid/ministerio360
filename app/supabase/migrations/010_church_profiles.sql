create extension if not exists "pgcrypto";

-- ============================================================
--  TABELA PRINCIPAL: church_profiles
-- ============================================================

create table if not exists public.church_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name text not null,
  trade_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  plan_slug text not null default 'free',
  subscription_active boolean not null default false
);

-- garantir que trade_name exista em bases antigas
alter table public.church_profiles
  add column if not exists trade_name text;

-- índice
create index if not exists idx_church_profiles_user_id
on public.church_profiles (user_id);

-- trigger updated_at
drop trigger if exists trg_church_profiles_updated_at on public.church_profiles;

create trigger trg_church_profiles_updated_at
before update on public.church_profiles
for each row execute function public.set_updated_at();


-- ============================================================
--  FK PARA TABELA plans
-- ============================================================

alter table public.church_profiles
drop constraint if exists fk_church_profiles_plan_slug;

alter table public.church_profiles
add constraint fk_church_profiles_plan_slug
  foreign key (plan_slug)
  references public.plans(plan_slug)
  on update cascade
  on delete restrict;


-- ============================================================
--  RLS
-- ============================================================

alter table public.church_profiles enable row level security;

drop policy if exists select_own_church_profile on public.church_profiles;
drop policy if exists update_own_church_profile on public.church_profiles;
drop policy if exists select_church_admin_all on public.church_profiles;
drop policy if exists update_church_admin_all on public.church_profiles;

-- dono da igreja vê sua própria igreja
create policy select_own_church_profile
on public.church_profiles
for select
to authenticated
using (auth.uid() = user_id);

-- dono da igreja pode atualizar sua igreja
create policy update_own_church_profile
on public.church_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ADMIN MASTER vê todas
create policy select_church_admin_all
on public.church_profiles
for select
to authenticated
using (auth.uid() = '289d49c4-8db0-49e2-b527-af90809f3be8');

-- ADMIN MASTER pode atualizar todas
create policy update_church_admin_all
on public.church_profiles
for update
to authenticated
using (auth.uid() = '289d49c4-8db0-49e2-b527-af90809f3be8')
with check (auth.uid() = '289d49c4-8db0-49e2-b527-af90809f3be8');


-- ============================================================
-- ℹ️ PERMISSÕES
-- ============================================================

revoke all on public.church_profiles from anon;
grant select, insert, update, delete on public.church_profiles to authenticated;


-- ============================================================
--  FUNÇÕES AUXILIARES
-- ============================================================

-- obtém church_id atual
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


--------------------------------------------------------------
-- Atualiza claims quando church_profiles muda
--------------------------------------------------------------

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
  where user_id = p_user_id;

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


-- ============================================================
--  CRIAR PERFIL AUTOMÁTICO PARA NOVO USUÁRIO
-- ============================================================

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


-- ============================================================
-- RELOAD

notify pgrst, 'reload schema';
