import { describe } from "vitest";
import { dbTest } from "./harness";

// Exclusão de conta pela página /excluir-conta (funções usadas só pelo servidor)
describe("Exclusão de conta", () => {
    dbTest("Titular com outro Pastor ativo: a igreja passa para ele e os dados continuam", `
declare p uuid; c uuid; p2 uuid; t uuid; i json;
begin
    p := pg_temp.t_church('Igreja Transfere');
    c := pg_temp.t_church_of(p);
    insert into members (name, church_id) values ('Membro A', c);
    p2 := pg_temp.t_user(p, 'pastor');
    t := pg_temp.t_user(p, 'tesoureiro');
    perform pg_temp.t_reset();

    i := public.account_deletion_info(p);
    perform pg_temp.t_eq(i->>'mode', 'transfer', 'modo');
    perform pg_temp.t_eq((i->>'successor_id')::uuid, p2, 'sucessor é o outro Pastor');
    perform pg_temp.t_eq((i->>'other_users')::int, 2, 'outros usuários');
    perform pg_temp.t_eq((select user_id from church_profiles where id = c), p, 'conferir não muda nada');

    perform public.delete_account(p, 'transfer');
    perform pg_temp.t_eq((select user_id from church_profiles where id = c), p2, 'igreja passou para o Pastor 2');
    perform pg_temp.t_eq((select count(*)::int from auth.users where id = p), 0, 'login do titular apagado');
    perform pg_temp.t_eq((select count(*)::int from auth.users where id = t), 1, 'tesoureiro continua');
    perform pg_temp.t_eq((select count(*)::int from members where church_id = c), 1, 'dados continuam');
end`);

    dbTest("Titular sozinho: apaga a igreja, visitantes, ministérios e os logins dos convidados", `
declare p uuid; c uuid; t uuid; l uuid;
begin
    p := pg_temp.t_church('Igreja Apaga');
    c := pg_temp.t_church_of(p);
    t := pg_temp.t_user(p, 'tesoureiro');
    l := pg_temp.t_user(p, 'lider');
    perform pg_temp.t_reset();
    insert into members (name, church_id) values ('Membro', c);
    insert into visitors (name, visit_date, church_id) values ('Visitante', current_date, c);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c);
    insert into transactions (type, amount, church_id) values ('entrada', 10, c);

    perform pg_temp.t_eq(public.account_deletion_info(p)->>'mode', 'delete_church', 'modo');
    perform public.delete_account(p, 'delete_church');

    perform pg_temp.t_eq((select count(*)::int from church_profiles where id = c), 0, 'igreja apagada');
    perform pg_temp.t_eq((select count(*)::int from visitors where church_id = c), 0, 'visitantes apagados');
    perform pg_temp.t_eq((select count(*)::int from ministries where church_id = c), 0, 'ministérios apagados');
    perform pg_temp.t_eq((select count(*)::int from members where church_id = c), 0, 'membros apagados');
    perform pg_temp.t_eq((select count(*)::int from transactions where church_id = c), 0, 'finanças apagadas');
    perform pg_temp.t_eq((select count(*)::int from auth.users where id in (p, t, l)), 0, 'os 3 logins apagados');
end`);

    dbTest("Usuário convidado: apaga só a conta dele", `
declare p uuid; c uuid; t uuid;
begin
    p := pg_temp.t_church('Igreja Convidado');
    c := pg_temp.t_church_of(p);
    t := pg_temp.t_user(p, 'tesoureiro');
    perform pg_temp.t_reset();
    perform pg_temp.t_eq(public.account_deletion_info(t)->>'mode', 'user_only', 'modo');
    perform pg_temp.t_eq(public.account_deletion_info(t)->>'church_name', 'Igreja Convidado', 'nome da igreja');
    perform public.delete_account(t, 'user_only');
    perform pg_temp.t_eq((select count(*)::int from auth.users where id = t), 0, 'login apagado');
    perform pg_temp.t_eq((select count(*)::int from church_profiles where id = c), 1, 'igreja continua');
end`);

    dbTest("Se a situação mudou entre conferir e confirmar, não apaga nada", `
declare p uuid; c uuid;
begin
    p := pg_temp.t_church('Igreja Mudou');
    c := pg_temp.t_church_of(p);
    perform pg_temp.t_user(p, 'pastor');
    perform pg_temp.t_reset();
    perform pg_temp.t_fails(format('select public.delete_account(%L, %L)', p, 'delete_church'), 'situação da igreja mudou', 'recusa');
    perform pg_temp.t_eq((select count(*)::int from church_profiles where id = c), 1, 'nada apagado');
end`);

    dbTest("Administrador não é excluído por aqui e só o servidor chama as funções", `
declare a uuid;
begin
    a := pg_temp.t_church('Igreja Admin');
    perform pg_temp.t_make_admin(a);
    perform pg_temp.t_eq(public.account_deletion_info(a)->>'mode', 'blocked', 'admin bloqueado');
    perform pg_temp.t_fails(format('select public.delete_account(%L, %L)', a, 'blocked'), 'não pode ser excluída', 'admin não exclui');
    perform pg_temp.t_ok(not has_function_privilege('authenticated', 'public.delete_account(uuid,text)', 'execute'), 'logado não chama');
    perform pg_temp.t_ok(not has_function_privilege('anon', 'public.account_deletion_info(uuid)', 'execute'), 'anônimo não chama');
    perform pg_temp.t_ok(not has_function_privilege('authenticated', 'public.account_deletion_info(uuid)', 'execute'), 'logado não confere');
end`);
});
