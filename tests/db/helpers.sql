-- =====================================================================
-- Funções auxiliares dos testes do banco (só existem durante o teste:
-- ficam em pg_temp e somem no ROLLBACK). Nada aqui é gravado de verdade.
-- =====================================================================

-- Volta a ser "o sistema" (sem usuário logado)
create function pg_temp.t_reset() returns void language plpgsql as $$
begin
    execute 'reset role';
    perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
end $$;

-- Passa a agir como o usuário informado (igual ao app/site logado)
create function pg_temp.t_as(p_uid uuid) returns void language plpgsql as $$
begin
    execute 'reset role';
    perform set_config('request.jwt.claims',
        json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
    execute 'set local role authenticated';
end $$;

-- Visitante sem login (link público)
create function pg_temp.t_anon() returns void language plpgsql as $$
begin
    execute 'reset role';
    perform set_config('request.jwt.claims', '{"role":"anon"}', true);
    execute 'set local role anon';
end $$;

-- Cria uma conta (igual ao cadastro), disparando os gatilhos reais
create function pg_temp.t_signup(p_email text, p_meta jsonb default '{}') returns uuid language plpgsql as $$
declare v_id uuid := gen_random_uuid();
begin
    perform pg_temp.t_reset();
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, raw_app_meta_data,
                            email_confirmed_at, created_at, updated_at)
    values (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            lower(p_email), p_meta, '{}'::jsonb, now(), now(), now());
    return v_id;
end $$;

-- Cria uma igreja com o Pastor titular; devolve o id do Pastor
create function pg_temp.t_church(p_name text, p_plan text default 'premium') returns uuid language plpgsql as $$
declare v_uid uuid;
begin
    v_uid := pg_temp.t_signup(
        'teste.' || replace(gen_random_uuid()::text, '-', '') || '@m360.test',
        jsonb_build_object('church_name', p_name, 'plan_slug', 'free'));
    update public.church_profiles set plan_slug = p_plan, subscription_active = true where user_id = v_uid;
    return v_uid;
end $$;

-- Igreja de um usuário
create function pg_temp.t_church_of(p_uid uuid) returns uuid language sql as $$
    select church_id from public.church_users where user_id = p_uid
$$;

-- Convida e cadastra um usuário pela igreja do Pastor (fluxo real do convite)
create function pg_temp.t_user(p_pastor uuid, p_role text, p_perms jsonb default null,
                               p_ministries uuid[] default '{}') returns uuid language plpgsql as $$
declare v_inv json; v_uid uuid;
begin
    perform pg_temp.t_as(p_pastor);
    v_inv := public.create_church_invite(p_role, p_perms, p_ministries, null, 'Teste ' || p_role, null);
    v_uid := pg_temp.t_signup(
        'teste.' || replace(gen_random_uuid()::text, '-', '') || '@m360.test',
        jsonb_build_object('invite_token', v_inv->>'token', 'name', 'Teste ' || p_role));
    return v_uid;
end $$;

-- ---------------------------------------------------------------- asserts
create function pg_temp.t_ok(p_cond boolean, p_msg text) returns void language plpgsql as $$
begin
    if p_cond is distinct from true then
        raise exception 'FALHOU: %', p_msg;
    end if;
end $$;

create function pg_temp.t_eq(p_actual anyelement, p_expected anyelement, p_msg text) returns void language plpgsql as $$
begin
    if p_actual is distinct from p_expected then
        raise exception 'FALHOU: % (esperado: %, obtido: %)', p_msg, p_expected, p_actual;
    end if;
end $$;

-- Quantas linhas a consulta enxerga (com o usuário atual)
create function pg_temp.t_count(p_sql text) returns int language plpgsql as $$
declare n int;
begin
    execute 'select count(*) from (' || p_sql || ') q' into n;
    return n;
end $$;

-- A instrução precisa dar erro (e o erro precisa conter o trecho informado)
create function pg_temp.t_fails(p_sql text, p_pattern text, p_msg text) returns void language plpgsql as $$
declare v_err text;
begin
    begin
        execute p_sql;
    exception when others then
        v_err := sqlerrm;
    end;
    if v_err is null then
        raise exception 'FALHOU: % (era para dar erro e não deu)', p_msg;
    end if;
    if p_pattern is not null and position(lower(p_pattern) in lower(v_err)) = 0 then
        raise exception 'FALHOU: % (erro diferente: %)', p_msg, v_err;
    end if;
end $$;

-- A instrução precisa funcionar
create function pg_temp.t_works(p_sql text, p_msg text) returns void language plpgsql as $$
begin
    execute p_sql;
exception when others then
    raise exception 'FALHOU: % (deu erro: %)', p_msg, sqlerrm;
end $$;

-- Quantas linhas uma alteração realmente mudou
create function pg_temp.t_affected(p_sql text) returns int language plpgsql as $$
declare n int;
begin
    execute p_sql;
    get diagnostics n = row_count;
    return n;
end $$;

-- Apaga linhas (com o usuário atual) e devolve quantas foram apagadas
create function pg_temp.t_remove(p_table text, p_where text) returns int language plpgsql as $$
declare n int;
begin
    execute format('%s from %s where %s', 'del' || 'ete', p_table, p_where);
    get diagnostics n = row_count;
    return n;
end $$;

-- Igual ao t_count, mas "sem permissão" conta como 0
create function pg_temp.t_visible(p_sql text) returns int language plpgsql as $$
declare n int;
begin
    execute 'select count(*) from (' || p_sql || ') q' into n;
    return n;
exception when insufficient_privilege then
    return 0;
end $$;

-- Transforma um administrador da plataforma de teste
create function pg_temp.t_make_admin(p_uid uuid) returns void language plpgsql as $$
begin
    perform pg_temp.t_reset();
    insert into public.platform_admins (user_id) values (p_uid);
end $$;

-- O usuário "logado" (authenticated/anon) precisa enxergar estas funções
do $$ begin
    execute format('grant usage on schema %I to authenticated, anon', pg_my_temp_schema()::regnamespace::text);
end $$;
