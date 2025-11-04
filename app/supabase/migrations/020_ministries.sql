create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  church_id uuid references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (church_id, name)
);

create index if not exists idx_ministries_church_id on public.ministries (church_id);

drop trigger if exists trg_ministries_updated_at on public.ministries;
create trigger trg_ministries_updated_at
before update on public.ministries
for each row execute function public.set_updated_at();

-- Preenche church_id automaticamente a partir do usuário
create or replace function public.set_ministry_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não é possível inserir ministério sem church_id.';
  end if;
  return new;
end$$;

drop trigger if exists trg_ministries_church_id on public.ministries;
create trigger trg_ministries_church_id
before insert on public.ministries
for each row execute function public.set_ministry_church_id();

alter table public.ministries enable row level security;

drop policy if exists "select_ministries_by_church" on public.ministries;
create policy "select_ministries_by_church"
on public.ministries
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "insert_ministries_by_church" on public.ministries;
create policy "insert_ministries_by_church"
on public.ministries
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "update_ministries_by_church" on public.ministries;
create policy "update_ministries_by_church"
on public.ministries
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "delete_ministries_by_church" on public.ministries;
create policy "delete_ministries_by_church"
on public.ministries
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

revoke all on public.ministries from anon;
grant select, insert, update, delete on public.ministries to authenticated;

notify pgrst, 'reload schema';
