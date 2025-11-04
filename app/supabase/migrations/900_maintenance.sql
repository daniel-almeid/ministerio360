-- Limpeza multi-tenant (sem JWT)
create or replace function public.clean_old_records()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_church_id uuid := public.current_church_id();
begin
  if v_church_id is null then
    raise exception 'Usuário sem church_id (church_profiles não encontrado para este auth.uid()).';
  end if;

  delete from public.events  where church_id = v_church_id and (date::date) <= v_today;
  delete from public.scales  where church_id = v_church_id and (date::date) <= v_today;

  raise notice 'Limpeza executada para % (America/Sao_Paulo), church_id=%', v_today, v_church_id;
end$$;

-- Exemplo: executar manualmente
-- select public.clean_old_records();
