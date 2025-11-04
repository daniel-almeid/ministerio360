create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('entrada', 'saida')),
  category text,
  person_name text,
  amount numeric(12,2) not null check (amount >= 0),
  note text,
  church_id uuid not null references public.church_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_church_id   on public.transactions (church_id);
create index if not exists idx_transactions_created_at  on public.transactions (created_at desc);

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- Preenche church_id automaticamente (sem JWT)
create or replace function public.set_transaction_church_id()
returns trigger language plpgsql as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;
  if new.church_id is null then
    raise exception 'Não é possível inserir transação sem church_id.';
  end if;
  return new;
end$$;

drop trigger if exists trg_transactions_church_id on public.transactions;
create trigger trg_transactions_church_id
before insert on public.transactions
for each row execute function public.set_transaction_church_id();

alter table public.transactions enable row level security;

drop policy if exists "select_transactions_by_church" on public.transactions;
drop policy if exists "insert_transactions_by_church" on public.transactions;
drop policy if exists "update_transactions_by_church" on public.transactions;
drop policy if exists "delete_transactions_by_church" on public.transactions;

create policy "select_transactions_by_church" on public.transactions
for select to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "insert_transactions_by_church" on public.transactions
for insert to authenticated
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "update_transactions_by_church" on public.transactions
for update to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id())
with check (auth.role() = 'service_role' or church_id = public.current_church_id());

create policy "delete_transactions_by_church" on public.transactions
for delete to authenticated
using (auth.role() = 'service_role' or church_id = public.current_church_id());

revoke all on public.transactions from anon;
grant select, insert, update, delete on public.transactions to authenticated;

notify pgrst, 'reload schema';
