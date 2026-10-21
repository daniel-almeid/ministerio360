import { describe } from "vitest";
import { dbTest } from "./harness";

// Convites, limite do plano, pausar, remover e a regra do "último Pastor"
describe("Usuários e convites", () => {
    dbTest("Só o Pastor convida e gerencia usuários", `
declare p uuid; t uuid;
begin
    p := pg_temp.t_church('Igreja');
    t := pg_temp.t_user(p, 'tesoureiro');
    perform pg_temp.t_as(t);
    perform pg_temp.t_fails($q$select public.create_church_invite('tesoureiro')$q$, 'Somente o Pastor', 'tesoureiro não convida');
    perform pg_temp.t_fails($q$select * from public.list_church_users()$q$, 'Somente o Pastor', 'tesoureiro não lista usuários');
    perform pg_temp.t_fails($q$select * from public.list_church_invites()$q$, 'Somente o Pastor', 'tesoureiro não lista convites');
    perform pg_temp.t_fails($q$select public.church_seat_info()$q$, 'Somente o Pastor', 'tesoureiro não vê vagas');
    perform pg_temp.t_fails(format('select public.set_church_user_status(%L, %L)', gen_random_uuid(), 'paused'), 'Somente o Pastor', 'tesoureiro não pausa');
    perform pg_temp.t_fails(format('select public.remove_church_user(%L)', gen_random_uuid()), 'Somente o Pastor', 'tesoureiro não remove');
    perform pg_temp.t_fails(format('select public.update_church_user(%L, %L)', gen_random_uuid(), 'pastor'), 'Somente o Pastor', 'tesoureiro não se promove');
    perform pg_temp.t_fails(format('update church_users set role = %L where user_id = %L', 'pastor', t), 'permission denied', 'não muda a própria função direto na tabela');
end`);

    dbTest("Limite de usuários de cada plano (usuários + convites pendentes)", `
declare pf uuid; ps uuid; pb uuid; pp uuid; i int;
begin
    pf := pg_temp.t_church('Grátis', 'free');
    perform pg_temp.t_as(pf);
    perform pg_temp.t_fails($q$select public.create_church_invite('tesoureiro')$q$, 'até 1', 'grátis: só o Pastor');

    ps := pg_temp.t_church('Padrão', 'standard');
    perform pg_temp.t_as(ps);
    perform public.create_church_invite('tesoureiro');
    perform public.create_church_invite('secretaria');
    perform pg_temp.t_eq((public.church_seat_info()->>'used')::int, 3, 'padrão: 1 usuário + 2 convites');
    perform pg_temp.t_fails($q$select public.create_church_invite('lider')$q$, 'até 3', 'padrão: o 4º é bloqueado');

    pb := pg_temp.t_church('Premium', 'premium_basic');
    perform pg_temp.t_as(pb);
    for i in 1..4 loop perform public.create_church_invite('lider'); end loop;
    perform pg_temp.t_fails($q$select public.create_church_invite('lider')$q$, 'até 5', 'premium: o 6º é bloqueado');

    pp := pg_temp.t_church('Premium+', 'premium');
    perform pg_temp.t_as(pp);
    for i in 1..10 loop perform public.create_church_invite('lider'); end loop;
    perform pg_temp.t_eq((public.church_seat_info()->>'limit'), null, 'premium+: ilimitado');
end`);

    dbTest("Cancelar convite libera a vaga", `
declare ps uuid; inv json;
begin
    ps := pg_temp.t_church('Padrão', 'standard');
    perform pg_temp.t_as(ps);
    inv := public.create_church_invite('tesoureiro');
    perform public.create_church_invite('secretaria');
    perform pg_temp.t_fails($q$select public.create_church_invite('lider')$q$, 'até 3', 'cheio');
    perform public.revoke_church_invite((inv->>'id')::uuid);
    perform pg_temp.t_works($q$select public.create_church_invite('lider')$q$, 'depois de cancelar, convida de novo');
end`);

    dbTest("Cadastro pelo convite cria o vínculo com a função e as permissões do convite", `
declare p uuid; c uuid; m uuid; inv json; u uuid; cu church_users%rowtype;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m;
    perform pg_temp.t_as(p);
    inv := public.create_church_invite('lider', null, array[m], null, 'Carlos', null);
    u := pg_temp.t_signup('carlos.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', inv->>'token'));
    select * into cu from church_users where user_id = u;
    perform pg_temp.t_eq(cu.church_id, c, 'entra na igreja certa');
    perform pg_temp.t_eq(cu.role, 'lider', 'com a função do convite');
    perform pg_temp.t_eq(cu.ministry_ids, array[m], 'com os ministérios do convite');
    perform pg_temp.t_eq(cu.permissions->>'escalas', 'own', 'com as permissões padrão');
    perform pg_temp.t_eq(cu.invited_by, p, 'registra quem convidou');
    perform pg_temp.t_eq((select count(*)::int from church_profiles where user_id = u), 0, 'não cria uma igreja nova');
    perform pg_temp.t_ok((select used_at is not null from church_invites where id = (inv->>'id')::uuid), 'convite marcado como usado');
end`);

    dbTest("Convite usado, cancelado, expirado ou de outro e-mail não funciona", `
declare p uuid; inv json; inv2 json; inv3 json; inv4 json;
begin
    p := pg_temp.t_church('Igreja');
    perform pg_temp.t_as(p);
    inv := public.create_church_invite('tesoureiro');
    inv2 := public.create_church_invite('secretaria');
    inv3 := public.create_church_invite('lider');
    inv4 := public.create_church_invite('lider', null, '{}', null, null, 'certo.' || p || '@m360.test');
    perform pg_temp.t_signup('a.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', inv->>'token'));
    perform pg_temp.t_fails(format('select pg_temp.t_signup(%L, %L)', 'b.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', inv->>'token')), 'já utilizado', 'convite usado');

    perform pg_temp.t_as(p);
    perform public.revoke_church_invite((inv2->>'id')::uuid);
    perform pg_temp.t_fails(format('select pg_temp.t_signup(%L, %L)', 'c.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', inv2->>'token')), 'já utilizado', 'convite cancelado');

    perform pg_temp.t_reset();
    update church_invites set expires_at = now() - interval '1 minute' where id = (inv3->>'id')::uuid;
    perform pg_temp.t_fails(format('select pg_temp.t_signup(%L, %L)', 'd.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', inv3->>'token')), 'expirou', 'convite expirado');

    perform pg_temp.t_fails(format('select pg_temp.t_signup(%L, %L)', 'errado.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', inv4->>'token')), 'outro e-mail', 'e-mail diferente');
    perform pg_temp.t_works(format('select pg_temp.t_signup(%L, %L)', 'certo.' || p || '@m360.test', jsonb_build_object('invite_token', inv4->>'token')), 'e-mail certo funciona');
    perform pg_temp.t_fails(format('select pg_temp.t_signup(%L, %L)', 'e.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', 'nao-e-um-token')), 'inválido', 'token inválido');
end`);

    dbTest("Página do convite (sem login) mostra a situação certa", `
declare p uuid; ok json; rev json; exp json; used json;
begin
    p := pg_temp.t_church('Igreja Convite');
    perform pg_temp.t_as(p);
    ok := public.create_church_invite('tesoureiro', null, '{}', null, 'Maria', null);
    rev := public.create_church_invite('secretaria');
    exp := public.create_church_invite('lider');
    used := public.create_church_invite('lider');
    perform public.revoke_church_invite((rev->>'id')::uuid);
    perform pg_temp.t_reset();
    update church_invites set expires_at = now() - interval '1 day' where id = (exp->>'id')::uuid;
    perform pg_temp.t_signup('u.' || gen_random_uuid() || '@m360.test', jsonb_build_object('invite_token', used->>'token'));

    perform pg_temp.t_anon();
    perform pg_temp.t_eq(public.get_church_invite((ok->>'token')::uuid)->>'status', 'valid', 'válido');
    perform pg_temp.t_eq(public.get_church_invite((ok->>'token')::uuid)->>'church', 'Igreja Convite', 'mostra a igreja');
    perform pg_temp.t_eq(public.get_church_invite((ok->>'token')::uuid)->>'name', 'Maria', 'mostra o nome');
    perform pg_temp.t_eq(public.get_church_invite((rev->>'token')::uuid)->>'status', 'revoked', 'cancelado');
    perform pg_temp.t_eq(public.get_church_invite((exp->>'token')::uuid)->>'status', 'expired', 'expirado');
    perform pg_temp.t_eq(public.get_church_invite((used->>'token')::uuid)->>'status', 'used', 'usado');
    perform pg_temp.t_eq((public.get_church_invite(gen_random_uuid())->>'found')::boolean, false, 'inexistente');
end`);

    dbTest("Não convida e-mail que já tem conta nem repete convite pendente", `
declare p uuid; existente text := 'existe.' || gen_random_uuid() || '@m360.test'; novo text := 'novo.' || gen_random_uuid() || '@m360.test';
begin
    p := pg_temp.t_church('Igreja');
    perform pg_temp.t_signup(existente, '{"church_name":"Outra"}');
    perform pg_temp.t_as(p);
    perform pg_temp.t_fails(format('select public.create_church_invite(%L, null, %L, null, null, %L)', 'tesoureiro', '{}', existente), 'já tem uma conta', 'e-mail com conta');
    perform public.create_church_invite('tesoureiro', null, '{}', null, null, novo);
    perform pg_temp.t_fails(format('select public.create_church_invite(%L, null, %L, null, null, %L)', 'tesoureiro', '{}', upper(novo)), 'pendente', 'convite repetido (maiúsculas)');
    perform pg_temp.t_fails($q$select public.create_church_invite('dono')$q$, 'Função inválida', 'função inexistente');
end`);

    dbTest("Usuário pausado não vê nada; reativado volta a ver", `
declare p uuid; c uuid; t uuid; tid uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into transactions (type, amount, church_id) values ('entrada', 10, c);
    t := pg_temp.t_user(p, 'tesoureiro');
    select id into tid from church_users where user_id = t;

    perform pg_temp.t_as(p);
    perform public.set_church_user_status(tid, 'paused');
    perform pg_temp.t_as(t);
    perform pg_temp.t_eq(public.my_access()->>'status', 'paused', 'my_access mostra pausado');
    perform pg_temp.t_eq(public.current_church_id(), null, 'fica sem igreja');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from transactions'), 0, 'não vê transações');
    perform pg_temp.t_fails($q$insert into transactions (type, amount) values ('entrada', 1)$q$, null, 'não lança');

    perform pg_temp.t_as(p);
    perform public.set_church_user_status(tid, 'active');
    perform pg_temp.t_as(t);
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from transactions'), 1, 'reativado: vê de novo');
    perform pg_temp.t_as(p);
    perform pg_temp.t_fails(format('select public.set_church_user_status(%L, %L)', tid, 'bloqueado'), 'inválida', 'situação inválida');
end`);

    dbTest("Pastor não pausa nem remove a si mesmo; igreja nunca fica sem Pastor ativo", `
declare p uuid; c uuid; pid uuid; p2 uuid; p2id uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    select id into pid from church_users where user_id = p;
    perform pg_temp.t_as(p);
    perform pg_temp.t_fails(format('select public.set_church_user_status(%L, %L)', pid, 'paused'), 'próprio acesso', 'não se pausa');
    perform pg_temp.t_fails(format('select public.remove_church_user(%L)', pid), 'si mesmo', 'não se remove');

    perform pg_temp.t_reset();
    perform pg_temp.t_fails(format('update church_users set role = %L where id = %L', 'tesoureiro', pid), 'Pastor ativo', 'único Pastor não vira tesoureiro');
    perform pg_temp.t_fails(format('update church_users set status = %L where id = %L', 'paused', pid), 'Pastor ativo', 'único Pastor não é pausado');

    p2 := pg_temp.t_user(p, 'pastor');
    select id into p2id from church_users where user_id = p2;
    perform pg_temp.t_as(p2);
    perform pg_temp.t_works(format('select public.set_church_user_status(%L, %L)', pid, 'paused'), 'com dois Pastores, um pode ser pausado');
    perform pg_temp.t_reset();
    perform pg_temp.t_fails(format('update church_users set status = %L where id = %L', 'paused', p2id), 'Pastor ativo', 'mas não os dois');
end`);

    dbTest("Remover usuário apaga a conta; remover o titular passa a igreja para quem removeu", `
declare p uuid; c uuid; t uuid; tid uuid; p2 uuid; pid uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    t := pg_temp.t_user(p, 'tesoureiro');
    select id into tid from church_users where user_id = t;
    perform pg_temp.t_as(p);
    perform public.remove_church_user(tid);
    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select count(*)::int from auth.users where id = t), 0, 'conta apagada');
    perform pg_temp.t_eq((select count(*)::int from church_users where user_id = t), 0, 'vínculo apagado');

    p2 := pg_temp.t_user(p, 'pastor');
    select id into pid from church_users where user_id = p;
    perform pg_temp.t_as(p2);
    perform public.remove_church_user(pid);
    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select user_id from church_profiles where id = c), p2, 'titularidade passa para quem removeu');
    perform pg_temp.t_eq((select count(*)::int from church_profiles where id = c), 1, 'igreja continua existindo');
end`);

    dbTest("Pastor edita função, permissões e ministérios; vínculos de outra igreja são recusados", `
declare pa uuid; ca uuid; pb uuid; cb uuid; t uuid; tid uuid; mb uuid; memb uuid; ma uuid; cu church_users%rowtype;
begin
    pa := pg_temp.t_church('Igreja A');
    ca := pg_temp.t_church_of(pa);
    pb := pg_temp.t_church('Igreja B');
    cb := pg_temp.t_church_of(pb);
    insert into ministries (name, church_id) values ('Louvor A ' || gen_random_uuid(), ca) returning id into ma;
    insert into ministries (name, church_id) values ('Louvor B ' || gen_random_uuid(), cb) returning id into mb;
    insert into members (name, church_id) values ('Membro B', cb) returning id into memb;
    t := pg_temp.t_user(pa, 'tesoureiro');
    select id into tid from church_users where user_id = t;

    perform pg_temp.t_as(pa);
    perform public.update_church_user(tid, 'lider', null, array[ma], null);
    perform pg_temp.t_reset();
    select * into cu from church_users where id = tid;
    perform pg_temp.t_eq(cu.role, 'lider', 'função alterada');
    perform pg_temp.t_eq(cu.permissions->>'escalas', 'own', 'permissões padrão da nova função');
    perform pg_temp.t_eq(cu.ministry_ids, array[ma], 'ministérios alterados');

    perform pg_temp.t_as(pa);
    perform pg_temp.t_fails(format('select public.update_church_user(%L, %L, null, %L, null)', tid, 'lider', array[mb]), 'Ministério inválido', 'ministério de outra igreja');
    perform pg_temp.t_fails(format('select public.update_church_user(%L, %L, null, %L, %L)', tid, 'tesoureiro', '{}', memb), 'Membro inválido', 'membro de outra igreja');
    perform pg_temp.t_fails(format('select public.create_church_invite(%L, null, %L)', 'lider', array[mb]), 'Ministério inválido', 'convite com ministério de outra igreja');
    perform pg_temp.t_fails(format('select public.update_church_user(%L, %L)', tid, 'dono'), 'Função inválida', 'função inválida');
end`);

    dbTest("Pastor de uma igreja não mexe em usuários de outra", `
declare pa uuid; pb uuid; tb uuid; tbid uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    tb := pg_temp.t_user(pb, 'tesoureiro');
    select id into tbid from church_users where user_id = tb;
    perform pg_temp.t_as(pa);
    perform pg_temp.t_eq((select count(*)::int from public.list_church_users() where user_id = tb), 0, 'não lista usuário da outra igreja');
    perform pg_temp.t_fails(format('select public.set_church_user_status(%L, %L)', tbid, 'paused'), 'não encontrado', 'não pausa');
    perform pg_temp.t_fails(format('select public.remove_church_user(%L)', tbid), 'não encontrado', 'não remove');
    perform pg_temp.t_fails(format('select public.update_church_user(%L, %L)', tbid, 'secretaria'), 'não encontrado', 'não edita');
end`);
});
