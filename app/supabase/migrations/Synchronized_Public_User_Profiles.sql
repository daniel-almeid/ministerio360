--  TABELA: profiles (idempotente)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  church_id uuid references public.church_profiles(id) on delete set null,
  plan_slug text,
  subscription_active boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de usuários sincronizado com auth.users.';

--  GARANTIR QUE TODAS AS COLUNAS EXISTEM

alter table public.profiles add column if not exists email text;
alter table public.profiles alter column email set not null;

alter table public.profiles add column if not exists name text;

alter table public.profiles add column if not exists church_id uuid
  references public.church_profiles(id) on delete set null;

alter table public.profiles add column if not exists plan_slug text;

alter table public.profiles add column if not exists subscription_active boolean;

alter table public.profiles add column if not exists created_at timestamptz not null default now();

alter table public.profiles add column if not exists updated_at timestamptz not null default now();

--  ÍNDICES

create index if not exists idx_profiles_church_id
  on public.profiles(church_id);

create index if not exists idx_profiles_email
  on public.profiles(email);

--  TRIGGER: updated_at

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;

create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

--  FUNÇÃO: sync auth.users → profiles

create or replace function public.sync_profiles()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auth_users_sync_profiles on auth.users;

create trigger trg_auth_users_sync_profiles
after insert on auth.users
for each row execute procedure public.sync_profiles();

--  FUNÇÃO: sync church_profiles → profiles

create or replace function public.sync_profile_church()
returns trigger as $$
begin
  update public.profiles
  set
    church_id = new.id,
    plan_slug = new.plan_slug,
    subscription_active = new.subscription_active
  where id = new.user_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_profile_church on public.church_profiles;

create trigger trg_sync_profile_church
after insert or update on public.church_profiles
for each row execute procedure public.sync_profile_church();

--  RLS

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_admin_full_access on public.profiles;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id);

create policy profiles_admin_full_access
on public.profiles
for select
to authenticated
using (auth.uid() = '289d49c4-8db0-49e2-b527-af90809f3be8');

--  SYNC RETROATIVO — PARTE MAIS IMPORTANTE

-- Inserir perfis faltantes
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- Preencher o church_id, plano e assinatura de todos usuários existentes
update public.profiles p
set
  church_id = c.id,
  plan_slug = c.plan_slug,
  subscription_active = c.subscription_active
from public.church_profiles c
where c.user_id = p.id;

--  Atualizar claims de TODOS os usuários

do $$
declare r record;
begin
  for r in select id from auth.users loop
    perform public.refresh_church_claim(r.id);
  end loop;
end$$;

notify pgrst, 'reload schema';
