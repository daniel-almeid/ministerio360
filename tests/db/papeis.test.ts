import { describe } from "vitest";
import { dbTest } from "./harness";

// O que cada função pode ver e fazer (padrões e permissões personalizadas)
describe("Funções e permissões", () => {
    dbTest("Tesoureiro (padrão): finanças completas, membros e agenda só leitura", `
declare p uuid; c uuid; t uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into members (name, church_id) values ('Membro', c);
    insert into visitors (name, visit_date, church_id) values ('Visitante', current_date, c);
    insert into events (title, date, church_id) values ('Culto', now(), c);
    insert into scales (event_name, date, ministries, church_id) values ('Escala', now(), '[]', c);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c);
    insert into transactions (type, amount, church_id) values ('entrada', 10, c);
    t := pg_temp.t_user(p, 'tesoureiro');

    perform pg_temp.t_as(t);
    perform pg_temp.t_eq((public.my_access()->>'role'), 'tesoureiro', 'my_access mostra a função');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from transactions'), 1, 'vê transações');
    perform pg_temp.t_works($q$insert into transactions (type, amount) values ('entrada', 20)$q$, 'lança transação');
    perform pg_temp.t_works($q$insert into finance_accounts (name) values ('Banco')$q$, 'cria conta');
    perform pg_temp.t_works($q$insert into recurring_expenses (description, amount, day_of_month) values ('Luz', 50, 10)$q$, 'cria recorrente');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from members'), 1, 'vê membros');
    perform pg_temp.t_fails($q$insert into members (name) values ('X')$q$, 'row-level security', 'não cria membro');
    perform pg_temp.t_eq(pg_temp.t_affected($q$update members set name = 'X'$q$), 0, 'não altera membro');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from events'), 1, 'vê agenda');
    perform pg_temp.t_fails(format('insert into events (title, date, church_id) values (%L, now(), %L)', 'E', c), 'row-level security', 'não cria evento');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from visitors'), 0, 'não vê visitantes');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from scales'), 0, 'não vê escalas');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from ministries'), 1, 'vê a lista de ministérios');
    perform pg_temp.t_fails($q$insert into ministries (name) values ('X')$q$, 'row-level security', 'não cria ministério');
    perform pg_temp.t_eq(pg_temp.t_affected($q$update church_profiles set name = 'X'$q$), 0, 'não altera dados da igreja');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from subscriptions'), 0, 'não vê assinatura');
end`);

    dbTest("Secretaria (padrão): membros, visitantes, ministérios e agenda; escalas só leitura; sem finanças", `
declare p uuid; c uuid; s uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into scales (event_name, date, ministries, church_id) values ('Escala', now(), '[]', c);
    insert into transactions (type, amount, church_id) values ('entrada', 10, c);
    s := pg_temp.t_user(p, 'secretaria');

    perform pg_temp.t_as(s);
    perform pg_temp.t_works($q$insert into members (name) values ('Novo')$q$, 'cria membro');
    perform pg_temp.t_works($q$insert into visitors (name, visit_date) values ('Novo', current_date)$q$, 'cria visitante');
    perform pg_temp.t_works($q$insert into ministries (name) values ('Novo ' || gen_random_uuid())$q$, 'cria ministério');
    perform pg_temp.t_works(format('insert into events (title, date, church_id) values (%L, now(), %L)', 'Culto', c), 'cria evento');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from scales'), 1, 'vê escalas');
    perform pg_temp.t_fails(format('insert into scales (event_name, date, ministries, church_id) values (%L, now(), %L, %L)', 'X', '[]', c), 'row-level security', 'não cria escala');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from transactions'), 0, 'não vê transações');
    perform pg_temp.t_fails($q$insert into transactions (type, amount) values ('entrada', 5)$q$, null, 'não lança transação');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from finance_accounts'), 0, 'não vê contas');
end`);

    dbTest("Líder (padrão): agenda, membros e ministérios só leitura; sem visitantes e finanças", `
declare p uuid; c uuid; l uuid; m uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m;
    insert into members (name, church_id) values ('Membro', c);
    insert into visitors (name, visit_date, church_id) values ('Visitante', current_date, c);
    l := pg_temp.t_user(p, 'lider', null, array[m]);

    perform pg_temp.t_as(l);
    perform pg_temp.t_eq((public.my_access()->'ministry_ids'->>0)::uuid, m, 'my_access traz os ministérios');
    perform pg_temp.t_works(format('insert into events (title, date, church_id) values (%L, now(), %L)', 'Ensaio', c), 'cria evento');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from members'), 1, 'vê membros');
    perform pg_temp.t_fails($q$insert into members (name) values ('X')$q$, 'row-level security', 'não cria membro');
    perform pg_temp.t_fails($q$insert into ministries (name) values ('X')$q$, 'row-level security', 'não cria ministério');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from visitors'), 0, 'não vê visitantes');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from transactions'), 0, 'não vê transações');
end`);

    dbTest("Pastor convidado tem acesso total, mesmo que tentem limitar", `
declare p uuid; p2 uuid;
begin
    p := pg_temp.t_church('Igreja');
    p2 := pg_temp.t_user(p, 'pastor', '{"membros":"none","visitantes":"none","ministerios":"none","agenda":"none","escalas":"none","financas":"none"}');
    perform pg_temp.t_as(p2);
    perform pg_temp.t_eq((public.my_access()->'permissions'->>'financas'), 'edit', 'permissões viram as de Pastor');
    perform pg_temp.t_ok(public.has_permission('financas', 'edit'), 'pode editar finanças');
    perform pg_temp.t_ok(public.has_permission('escalas', 'all'), 'pode editar todas as escalas');
    perform pg_temp.t_works($q$insert into transactions (type, amount) values ('entrada', 1)$q$, 'lança transação');
    perform pg_temp.t_works($q$select public.create_church_invite('tesoureiro')$q$, 'pode convidar usuários');
end`);

    dbTest("Permissões personalizadas valem no banco (ver x editar x nenhum)", `
declare p uuid; c uuid; a uuid; b uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into transactions (type, amount, church_id) values ('entrada', 10, c);
    insert into members (name, church_id) values ('Membro', c);

    -- Tesoureiro só com "ver" em finanças
    a := pg_temp.t_user(p, 'tesoureiro', '{"membros":"none","visitantes":"none","ministerios":"none","agenda":"none","escalas":"none","financas":"view"}');
    perform pg_temp.t_as(a);
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from transactions'), 1, 'ver: enxerga transações');
    perform pg_temp.t_fails($q$insert into transactions (type, amount) values ('entrada', 1)$q$, null, 'ver: não lança');
    perform pg_temp.t_eq(pg_temp.t_affected($q$update transactions set amount = 99$q$), 0, 'ver: não altera');
    perform pg_temp.t_eq(pg_temp.t_remove('transactions', 'true'), 0, 'ver: não apaga');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from members'), 0, 'membros nenhum: não vê membros');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from events'), 0, 'agenda nenhum: não vê eventos');

    -- Secretaria com finanças liberadas para editar
    b := pg_temp.t_user(p, 'secretaria', '{"membros":"edit","visitantes":"none","ministerios":"none","agenda":"none","escalas":"none","financas":"edit"}');
    perform pg_temp.t_as(b);
    perform pg_temp.t_works($q$insert into transactions (type, amount) values ('saida', 3)$q$, 'personalizado: lança transação');
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from visitors'), 0, 'personalizado: visitantes bloqueados');
end`);

    dbTest("Quem edita finanças ou escalas consegue ler membros (para os seletores)", `
declare p uuid; c uuid; a uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into members (name, church_id) values ('Membro', c);
    a := pg_temp.t_user(p, 'tesoureiro', '{"membros":"none","visitantes":"none","ministerios":"none","agenda":"none","escalas":"none","financas":"edit"}');
    perform pg_temp.t_as(a);
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from members'), 1, 'finanças edit lê membros');
    perform pg_temp.t_fails($q$insert into members (name) values ('X')$q$, 'row-level security', 'mas não cria membro');
end`);
});
