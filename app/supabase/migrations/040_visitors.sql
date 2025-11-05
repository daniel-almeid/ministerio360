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
  followup_status visitor_followup_status default 'pendente',
  phone text,
  email text,
  notes text,
  is_member boolean default false,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_visitors_church_id on public.visitors(church_id);

drop trigger if exists trg_visitors_updated_at on public.visitors;
create trigger trg_visitors_updated_at
before update on public.visitors
for each row execute function public.set_updated_at();

drop trigger if exists trg_visitors_church_id on public.visitors;
create trigger trg_visitors_church_id
before insert on public.visitors
for each row execute function public.set_church_id();

alter table public.visitors enable row level security;

drop policy if exists "visitors_rls" on public.visitors;
create policy "visitors_rls"
on public.visitors
for all to authenticated
using (church_id = (auth.jwt() ->> 'church_id')::uuid)
with check (church_id = (auth.jwt() ->> 'church_id')::uuid);

grant all on public.visitors to authenticated;
revoke all on public.visitors from anon;
