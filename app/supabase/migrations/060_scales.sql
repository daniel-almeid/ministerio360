-- Garante colunas
alter table if exists public.scales
  add column if not exists church_id uuid references public.church_profiles(id) on delete cascade;

alter table if exists public.scale_ministries
  add column if not exists church_id uuid references public.church_profiles(id) on delete cascade;

alter table if exists public.scale_assignments
  add column if not exists church_id uuid references public.church_profiles(id) on delete cascade;

create index if not exists idx_scales_church_id             on public.scales (church_id);
create index if not exists idx_scale_ministries_church_id   on public.scale_ministries (church_id);
create index if not exists idx_scale_assignments_church_id  on public.scale_assignments (church_id);

-- Preenche church_id
create or replace function public.set_scale_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não é possível inserir escala sem church_id.';
  end if;
  return new;
end$$;

drop trigger if exists trg_scales_church_id on public.scales;
create trigger trg_scales_church_id
before insert on public.scales
for each row execute function public.set_scale_church_id();

-- Filhos herdam da escala
create or replace function public.set_scale_child_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    select church_id into new.church_id
    from public.scales
    where id = new.scale_id;
  end if;
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não foi possível definir church_id em registro filho de escala.';
  end if;
  return new;
end$$;

drop trigger if exists trg_scale_ministries_church on public.scale_ministries;
create trigger trg_scale_ministries_church
before insert on public.scale_ministries
for each row execute function public.set_scale_child_church_id();

drop trigger if exists trg_scale_assignments_church on public.scale_assignments;
create trigger trg_scale_assignments_church
before insert on public.scale_assignments
for each row execute function public.set_scale_child_church_id();

-- RLS
alter table public.scales enable row level security;
alter table public.scale_ministries enable row level security;
alter table public.scale_assignments enable row level security;

-- policies (scales)
drop policy if exists "select_scales_by_church"  on public.scales;
drop policy if exists "insert_scales_by_church"  on public.scales;
drop policy if exists "update_scales_by_church"  on public.scales;
drop policy if exists "delete_scales_by_church"  on public.scales;

create policy "select_scales_by_church" on public.scales
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "insert_scales_by_church" on public.scales
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "update_scales_by_church" on public.scales
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "delete_scales_by_church" on public.scales
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

-- policies (scale_ministries)
drop policy if exists "select_scale_ministries_by_church"  on public.scale_ministries;
drop policy if exists "insert_scale_ministries_by_church"  on public.scale_ministries;
drop policy if exists "update_scale_ministries_by_church"  on public.scale_ministries;
drop policy if exists "delete_scale_ministries_by_church"  on public.scale_ministries;

create policy "select_scale_ministries_by_church" on public.scale_ministries
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "insert_scale_ministries_by_church" on public.scale_ministries
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "update_scale_ministries_by_church" on public.scale_ministries
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "delete_scale_ministries_by_church" on public.scale_ministries
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

-- policies (scale_assignments)
drop policy if exists "select_scale_assignments_by_church"  on public.scale_assignments;
drop policy if exists "insert_scale_assignments_by_church"  on public.scale_assignments;
drop policy if exists "update_scale_assignments_by_church"  on public.scale_assignments;
drop policy if exists "delete_scale_assignments_by_church"  on public.scale_assignments;

create policy "select_scale_assignments_by_church" on public.scale_assignments
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "insert_scale_assignments_by_church" on public.scale_assignments
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "update_scale_assignments_by_church" on public.scale_assignments
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "delete_scale_assignments_by_church" on public.scale_assignments
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

revoke all on public.scales, public.scale_ministries, public.scale_assignments from anon;
grant  select, insert, update, delete on public.scales              to authenticated;
grant  select, insert, update, delete on public.scale_ministries    to authenticated;
grant  select, insert, update, delete on public.scale_assignments   to authenticated;

notify pgrst, 'reload schema';
