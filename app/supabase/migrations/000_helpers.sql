-- =========================================================
-- EXTENSÕES E FUNÇÕES GLOBAIS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- FUNÇÃO: Atualiza automaticamente o campo updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =========================================================
-- FUNÇÃO CENTRAL: Retorna o church_id atual de forma segura
-- =========================================================
create or replace function public.current_church_id()
returns uuid
language sql
stable
set search_path = public
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.church_id', true), '')::uuid,
    (
      select id
      from public.church_profiles
      where user_id = auth.uid()
      limit 1
    )
  );
$$;

grant execute on function public.current_church_id() to authenticated;

-- =========================================================
-- FUNÇÃO: Define church_id automaticamente em inserts
-- =========================================================
create or replace function public.set_church_id()
returns trigger
language plpgsql
as $$
begin
  if new.church_id is null then
    new.church_id := public.current_church_id();
  end if;

  if new.church_id is null then
    raise exception 'Não foi possível definir o church_id para o registro.';
  end if;

  return new;
end;
$$;

grant execute on function public.set_church_id() to authenticated;

-- =========================================================
-- UTILIDADE: Recarregar schema manualmente
-- =========================================================
-- notify pgrst, 'reload schema';
