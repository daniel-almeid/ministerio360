create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text default 'Ativo',
  ministry_id uuid references public.ministries(id) on delete set null,
  joined_at date default now(),
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_members_church_id on public.members(church_id);

drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
before update on public.members
for each row execute function public.set_updated_at();

drop trigger if exists trg_members_church_id on public.members;
create trigger trg_members_church_id
before insert on public.members
for each row execute function public.set_church_id();

alter table public.members enable row level security;

drop policy if exists "members_rls" on public.members;
create policy "members_rls"
on public.members
for all to authenticated
using (church_id = (auth.jwt() ->> 'church_id')::uuid)
with check (church_id = (auth.jwt() ->> 'church_id')::uuid);

grant all on public.members to authenticated;
revoke all on public.members from anon;
