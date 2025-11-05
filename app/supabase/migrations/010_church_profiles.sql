-- ==========================================================
-- EXTENSÕES NECESSÁRIAS
-- ==========================================================
create extension if not exists "pgcrypto";

-- ==========================================================
-- TABELA: CHURCH_PROFILES
-- ==========================================================
create table if not exists public.church_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_church_profiles_user_id
on public.church_profiles (user_id);

-- ==========================================================
-- TRIGGER: atualiza automaticamente o campo updated_at
-- ==========================================================
drop trigger if exists trg_church_profiles_updated_at on public.church_profiles;
create trigger trg_church_profiles_updated_at
before update on public.church_profiles
for each row execute function public.set_updated_at();

-- ==========================================================
-- RLS: cada usuário só acessa sua própria igreja
-- ==========================================================
alter table public.church_profiles enable row level security;

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

-- ==========================================================
-- FUNÇÃO: retorna o church_id atual (do JWT ou via fallback)
-- ==========================================================
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

-- ==========================================================
-- FUNÇÃO: atualiza o claim church_id no JWT
-- ==========================================================
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
    raise notice '❌ Usuário % não possui church_profile', p_user_id;
    return json_build_object('status', 'error', 'message', 'church_profile não encontrado');
  end if;

  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{church_id}',
    to_jsonb(v_church_id)
  )
  where id = p_user_id;

  raise notice '✅ Claim church_id atualizado: % -> %', p_user_id, v_church_id;
  return json_build_object('status', 'success', 'church_id', v_church_id);
end;
$$;

grant execute on function public.refresh_church_claim(uuid) to authenticated;

-- ==========================================================
-- FUNÇÃO: cria automaticamente um perfil ao registrar usuário
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_church_id uuid;
begin
  -- Cria o perfil da igreja
  insert into public.church_profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'church_name', 'Igreja sem nome'))
  returning id into v_church_id;

  -- Atualiza o claim church_id imediatamente
  perform public.refresh_church_claim(new.id);

  raise notice '🏗️ Novo usuário %, igreja criada %', new.id, v_church_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ==========================================================
-- RELOAD DO SCHEMA PARA POSTGREST
-- ==========================================================
notify pgrst, 'reload schema';
