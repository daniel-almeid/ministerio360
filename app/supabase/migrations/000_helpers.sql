-- Extensões
create extension if not exists "pgcrypto";

-- Função global e única para updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

-- 🔹 ÚNICA FONTE DA VERDADE DO church_id (sem JWT)
-- Retorna a igreja do usuário logado (auth.uid()).
create or replace function public.current_church_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.church_profiles
  where user_id = auth.uid()
  limit 1
$$;

-- Conveniência: força o PostgREST a recarregar schema quando você quiser
-- notify pgrst, 'reload schema';
