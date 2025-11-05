create or replace function public.clean_old_records()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
  v_church_id uuid := (auth.jwt() ->> 'church_id')::uuid;
begin
  if v_church_id is null then
    raise exception 'JWT sem church_id.';
  end if;

  delete from public.events where church_id = v_church_id and (date::date) <= v_today;
  delete from public.scales where church_id = v_church_id and (date::date) <= v_today;

  raise notice 'Limpeza concluída para % (church_id=%)', v_today, v_church_id;
end$$;
