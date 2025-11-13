-- ==========================================================
-- ENUM: visitor_followup_status
-- ==========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'visitor_followup_status') then
    create type visitor_followup_status as enum ('pendente', 'em_andamento', 'concluido');
  end if;
end$$;

-- ==========================================================
-- TABELA: visitors (Isolamento por igreja)
-- ==========================================================
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visit_date date not null,
  followup_status visitor_followup_status default 'pendente',
  phone text,
  email text,
  notes text,
  is_member boolean default false,
  archived boolean default false, -- <- NOVO
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (church_id, name, visit_date)
);

create index if not exists idx_visitors_church_id
on public.visitors(church_id);

create index if not exists idx_visitors_archived
on public.visitors(archived);

-- ==========================================================
-- TRIGGERS
-- ==========================================================
drop trigger if exists trg_visitors_updated_at on public.visitors;
create trigger trg_visitors_updated_at
before update on public.visitors
for each row
execute function public.set_updated_at();

drop trigger if exists trg_visitors_church_id on public.visitors;
create trigger trg_visitors_church_id
before insert on public.visitors
for each row
execute function public.set_church_id();

-- ==========================================================
-- RLS E POLÍTICAS
-- ==========================================================
alter table public.visitors enable row level security;
alter table public.visitors force row level security;

drop policy if exists select_visitors_by_church on public.visitors;
drop policy if exists select_archived_visitors_by_church on public.visitors;
drop policy if exists insert_visitors_by_church on public.visitors;
drop policy if exists update_visitors_by_church on public.visitors;
drop policy if exists delete_visitors_by_church on public.visitors;

-- SELECT — visitantes ativos (não arquivados)
create policy select_visitors_by_church
on public.visitors
for select
to authenticated
using (
    church_id = public.current_church_id()
    AND archived = false
);

-- SELECT — visitantes arquivados (se um dia quiser mostrar)
create policy select_archived_visitors_by_church
on public.visitors
for select
to authenticated
using (
    church_id = public.current_church_id()
    AND archived = true
);

-- INSERT — restrito à igreja do JWT
create policy insert_visitors_by_church
on public.visitors
for insert
to authenticated
with check (church_id = public.current_church_id());

-- UPDATE — somente registros da própria igreja
create policy update_visitors_by_church
on public.visitors
for update
to authenticated
using (church_id = public.current_church_id())
with check (church_id = public.current_church_id());

-- DELETE — idem
create policy delete_visitors_by_church
on public.visitors
for delete
to authenticated
using (church_id = public.current_church_id());

-- ==========================================================
-- PERMISSÕES E RELOAD
-- ==========================================================
revoke all on public.visitors from anon;
grant select, insert, update, delete on public.visitors to authenticated;

notify pgrst, 'reload schema';
