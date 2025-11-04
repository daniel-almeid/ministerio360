-- Garante colunas
alter table if exists public.members
  add column if not exists ministry_id uuid references public.ministries(id) on delete set null,
  add column if not exists church_id  uuid references public.church_profiles(id) on delete cascade;

create index if not exists idx_members_church_id on public.members (church_id);

drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
before update on public.members
for each row execute function public.set_updated_at();

-- Preenche church_id automaticamente
create or replace function public.set_member_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não é possível inserir membro sem church_id.';
  end if;
  return new;
end$$;

drop trigger if exists trg_members_church_id on public.members;
create trigger trg_members_church_id
before insert on public.members
for each row execute function public.set_member_church_id();

alter table public.members enable row level security;

drop policy if exists "select_members_by_church" on public.members;
create policy "select_members_by_church"
on public.members
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "insert_members_by_church" on public.members;
create policy "insert_members_by_church"
on public.members
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "update_members_by_church" on public.members;
create policy "update_members_by_church"
on public.members
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "delete_members_by_church" on public.members;
create policy "delete_members_by_church"
on public.members
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

revoke all on public.members from anon;
grant select, insert, update, delete on public.members to authenticated;

notify pgrst, 'reload schema';
