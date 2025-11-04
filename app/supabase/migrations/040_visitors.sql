do $$
begin
  if not exists (select 1 from pg_type where typname = 'visitor_followup_status') then
    create type visitor_followup_status as enum ('pendente', 'em_andamento', 'concluido');
  end if;
end$$;

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visit_date date not null,
  followup_status visitor_followup_status not null default 'pendente',
  phone text,
  email text,
  notes text,
  is_member boolean not null default false,
  church_id uuid references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_visitors_church_id on public.visitors (church_id);
create index if not exists idx_visitors_visit_date on public.visitors (visit_date);

drop trigger if exists trg_visitors_set_updated_at on public.visitors;
create trigger trg_visitors_set_updated_at
before update on public.visitors
for each row execute function public.set_updated_at();

-- Preenche church_id automaticamente
create or replace function public.set_visitor_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não é possível inserir visitante sem church_id.';
  end if;
  return new;
end$$;

drop trigger if exists trg_visitors_default_church on public.visitors;
create trigger trg_visitors_default_church
before insert on public.visitors
for each row execute function public.set_visitor_church_id();

alter table public.visitors enable row level security;

drop policy if exists "visitors_select_by_church" on public.visitors;
create policy "visitors_select_by_church"
on public.visitors
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "visitors_insert_by_church" on public.visitors;
create policy "visitors_insert_by_church"
on public.visitors
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "visitors_update_by_church" on public.visitors;
create policy "visitors_update_by_church"
on public.visitors
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

drop policy if exists "visitors_delete_by_church" on public.visitors;
create policy "visitors_delete_by_church"
on public.visitors
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

revoke all on public.visitors from anon;
grant select, insert, update, delete on public.visitors to authenticated;

notify pgrst, 'reload schema';
