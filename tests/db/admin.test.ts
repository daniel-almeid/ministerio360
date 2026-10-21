import { describe } from "vitest";
import { dbTest } from "./harness";

// Funções da tela Admin: só o administrador da plataforma usa
describe("Administração da plataforma", () => {
    dbTest("Quem não é admin é bloqueado em todas as funções de admin", `
declare p uuid; x uuid := gen_random_uuid();
begin
    p := pg_temp.t_church('Igreja');
    perform pg_temp.t_as(p);
    perform pg_temp.t_ok(not public.is_platform_admin(), 'Pastor não é admin');
    perform pg_temp.t_eq((public.my_access()->>'platform_admin')::boolean, false, 'my_access diz que não é admin');
    perform pg_temp.t_fails('select * from public.admin_list_users()', 'not authorized', 'lista de igrejas');
    perform pg_temp.t_fails('select * from public.admin_list_all_users()', 'not authorized', 'lista de usuários');
    perform pg_temp.t_fails('select * from public.admin_list_all_invites()', 'not authorized', 'lista de convites');
    perform pg_temp.t_fails(format('select * from public.admin_church_ministries(%L)', x), 'not authorized', 'ministérios de igreja');
    perform pg_temp.t_fails(format('select public.admin_update_church_user(%L, %L)', x, 'pastor'), 'not authorized', 'editar usuário');
    perform pg_temp.t_fails(format('select public.admin_set_church_user_status(%L, %L)', x, 'paused'), 'not authorized', 'pausar usuário');
    perform pg_temp.t_fails(format('select public.admin_remove_church_user(%L)', x), 'not authorized', 'remover usuário');
    perform pg_temp.t_fails(format('select public.admin_revoke_invite(%L)', x), 'not authorized', 'cancelar convite');
    perform pg_temp.t_fails(format('select public.admin_set_plan(%L, %L, true)', pg_temp.t_church_of(p), 'premium'), 'not authorized', 'trocar o próprio plano de graça');
    perform pg_temp.t_fails(format('select public.refresh_church_claim(%L)', gen_random_uuid()), 'not authorized', 'atualizar acesso de outra pessoa');
    perform pg_temp.t_fails(format('insert into platform_admins (user_id) values (%L)', p), null, 'virar admin sozinho');
end`);

    dbTest("Admin gerencia usuários e convites de qualquer igreja", `
declare a uuid; p uuid; c uuid; t uuid; tid uuid; m uuid; inv json; cu church_users%rowtype;
begin
    a := pg_temp.t_church('Igreja do Admin');
    perform pg_temp.t_make_admin(a);
    p := pg_temp.t_church('Igreja Cliente');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m;
    t := pg_temp.t_user(p, 'tesoureiro');
    select id into tid from church_users where user_id = t;
    perform pg_temp.t_as(p);
    inv := public.create_church_invite('secretaria');

    perform pg_temp.t_as(a);
    perform pg_temp.t_eq((public.my_access()->>'platform_admin')::boolean, true, 'my_access diz que é admin');
    perform pg_temp.t_ok((select count(*) from public.admin_list_all_users() where church_id = c) = 2, 'lista os usuários da igreja cliente');
    perform pg_temp.t_ok((select count(*) from public.admin_list_all_invites() where church_id = c) = 1, 'lista o convite pendente');
    perform pg_temp.t_eq((select count(*)::int from public.admin_church_ministries(c)), 1, 'lista os ministérios da igreja');
    perform pg_temp.t_ok((select is_owner from public.admin_list_all_users() where user_id = p), 'marca o titular');

    perform public.admin_update_church_user(tid, 'lider', null, array[m]);
    perform public.admin_set_church_user_status(tid, 'paused');
    perform pg_temp.t_reset();
    select * into cu from church_users where id = tid;
    perform pg_temp.t_eq(cu.role, 'lider', 'função alterada pelo admin');
    perform pg_temp.t_eq(cu.ministry_ids, array[m], 'ministérios alterados pelo admin');
    perform pg_temp.t_eq(cu.status, 'paused', 'pausado pelo admin');

    perform pg_temp.t_as(a);
    perform public.admin_revoke_invite((inv->>'id')::uuid);
    perform pg_temp.t_eq((select count(*)::int from public.admin_list_all_invites() where church_id = c), 0, 'convite cancelado');
    perform public.admin_remove_church_user(tid);
    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select count(*)::int from auth.users where id = t), 0, 'conta removida pelo admin');
end`);

    dbTest("Admin respeita as travas: não remove o único Pastor, nem a si mesmo, nem outro admin", `
declare a uuid; aid uuid; p uuid; pid uuid; b uuid; bid uuid;
begin
    a := pg_temp.t_church('Igreja do Admin');
    perform pg_temp.t_make_admin(a);
    select id into aid from church_users where user_id = a;
    p := pg_temp.t_church('Igreja Cliente');
    select id into pid from church_users where user_id = p;
    b := pg_temp.t_church('Igreja Admin 2');
    perform pg_temp.t_make_admin(b);
    select id into bid from church_users where user_id = b;

    perform pg_temp.t_as(a);
    perform pg_temp.t_fails(format('select public.admin_remove_church_user(%L)', pid), 'Pastor ativo', 'único Pastor da igreja');
    perform pg_temp.t_fails(format('select public.admin_set_church_user_status(%L, %L)', pid, 'paused'), 'Pastor ativo', 'pausar o único Pastor');
    perform pg_temp.t_fails(format('select public.admin_remove_church_user(%L)', aid), 'si mesmo', 'a si mesmo');
    perform pg_temp.t_fails(format('select public.admin_set_church_user_status(%L, %L)', aid, 'paused'), 'próprio acesso', 'pausar a si mesmo');
    perform pg_temp.t_fails(format('select public.admin_remove_church_user(%L)', bid), 'não pode ser removido', 'outro admin');
    perform pg_temp.t_fails(format('select public.admin_update_church_user(%L, %L)', pid, 'chefe'), 'Função inválida', 'função inválida');
end`);

    dbTest("Admin troca plano e ciclo, e o acesso de todos da igreja é atualizado", `
declare a uuid; p uuid; c uuid; t uuid; cp church_profiles%rowtype;
begin
    a := pg_temp.t_church('Igreja do Admin');
    perform pg_temp.t_make_admin(a);
    p := pg_temp.t_church('Igreja Cliente', 'standard');
    c := pg_temp.t_church_of(p);
    t := pg_temp.t_user(p, 'tesoureiro');

    perform pg_temp.t_as(a);
    perform public.admin_set_plan(c, 'premium_basic', true, 'yearly');
    perform pg_temp.t_reset();
    select * into cp from church_profiles where id = c;
    perform pg_temp.t_eq(cp.plan_slug, 'premium_basic', 'plano alterado');
    perform pg_temp.t_eq(cp.billing_cycle, 'yearly', 'ciclo alterado');
    perform pg_temp.t_eq((select raw_app_meta_data->>'plan_slug' from auth.users where id = p), 'premium_basic', 'acesso do Pastor atualizado');
    perform pg_temp.t_eq((select raw_app_meta_data->>'plan_slug' from auth.users where id = t), 'premium_basic', 'acesso do tesoureiro atualizado');

    perform pg_temp.t_as(a);
    perform public.admin_set_plan(c, 'standard', false);
    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select billing_cycle from church_profiles where id = c), 'yearly', 'sem ciclo informado, mantém o atual');
    perform pg_temp.t_as(a);
    perform pg_temp.t_fails(format('select public.admin_set_plan(%L, %L, true)', c, 'ouro'), 'invalid plan', 'plano inválido');
    perform pg_temp.t_fails(format('select public.admin_set_plan(%L, %L, true, %L)', c, 'premium', 'semanal'), 'invalid billing cycle', 'ciclo inválido');
    perform pg_temp.t_fails(format('select public.admin_set_plan(%L, %L, true)', gen_random_uuid(), 'premium'), 'church not found', 'igreja inexistente');
end`);

    dbTest("Admin vê todas as igrejas na lista; Pastor vê só a sua", `
declare a uuid; p1 uuid; p2 uuid;
begin
    a := pg_temp.t_church('Igreja do Admin');
    perform pg_temp.t_make_admin(a);
    p1 := pg_temp.t_church('Cliente 1');
    p2 := pg_temp.t_church('Cliente 2');
    perform pg_temp.t_as(a);
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from church_profiles where id in (%L, %L)', pg_temp.t_church_of(p1), pg_temp.t_church_of(p2))), 2, 'admin vê as duas');
    perform pg_temp.t_ok((select count(*) from public.admin_list_users() where user_id in (p1, p2)) = 2, 'admin_list_users traz as duas');
    perform pg_temp.t_as(p1);
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from church_profiles'), 1, 'Pastor vê só a sua');
end`);
});
