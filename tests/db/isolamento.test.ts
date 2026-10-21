import { describe } from "vitest";
import { dbTest } from "./harness";

// Uma igreja nunca pode ver nem mexer nos dados de outra
describe("Isolamento entre igrejas", () => {
    dbTest("Pastor não enxerga nenhum dado de outra igreja", `
declare pa uuid; pb uuid; ca uuid; cb uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    ca := pg_temp.t_church_of(pa);
    cb := pg_temp.t_church_of(pb);

    insert into members (name, church_id) values ('Membro B', cb);
    insert into visitors (name, visit_date, church_id) values ('Visitante B', current_date, cb);
    insert into ministries (name, church_id) values ('Louvor B ' || gen_random_uuid(), cb);
    insert into events (title, date, church_id) values ('Culto B', now(), cb);
    insert into scales (event_name, date, ministries, church_id) values ('Escala B', now(), '[]', cb);
    insert into transactions (type, amount, church_id) values ('entrada', 50, cb);
    insert into finance_accounts (name, church_id) values ('Caixa B', cb);
    insert into recurring_expenses (description, amount, day_of_month, church_id) values ('Aluguel B', 100, 5, cb);

    perform pg_temp.t_as(pa);
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from members where church_id = %L', cb)), 0, 'membros');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from visitors where church_id = %L', cb)), 0, 'visitantes');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from ministries where church_id = %L', cb)), 0, 'ministérios');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from events where church_id = %L', cb)), 0, 'eventos');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from scales where church_id = %L', cb)), 0, 'escalas');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from transactions where church_id = %L', cb)), 0, 'transações');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from finance_accounts where church_id = %L', cb)), 0, 'contas');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from recurring_expenses where church_id = %L', cb)), 0, 'recorrentes');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from church_profiles where id = %L', cb)), 0, 'perfil da igreja');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from church_users where church_id = %L', cb)), 0, 'usuários da igreja');
    perform pg_temp.t_eq(pg_temp.t_count(format('select 1 from church_profiles where id = %L', ca)), 1, 'vê a própria igreja');
end`);

    dbTest("Pastor não altera, não apaga e não cria dados em outra igreja", `
declare pa uuid; pb uuid; cb uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    cb := pg_temp.t_church_of(pb);
    insert into members (name, church_id) values ('Membro B', cb);
    insert into visitors (name, visit_date, church_id) values ('Visitante B', current_date, cb);
    insert into transactions (type, amount, church_id) values ('entrada', 50, cb);

    perform pg_temp.t_as(pa);
    perform pg_temp.t_eq(pg_temp.t_affected(format('update members set name = %L where church_id = %L', 'Hack', cb)), 0, 'altera membro');
    perform pg_temp.t_eq(pg_temp.t_affected(format('update transactions set amount = 1 where church_id = %L', cb)), 0, 'altera transação');
    perform pg_temp.t_eq(pg_temp.t_remove('visitors', format('church_id = %L', cb)), 0, 'apaga visitante');
    perform pg_temp.t_eq(pg_temp.t_remove('members', format('church_id = %L', cb)), 0, 'apaga membro');
    perform pg_temp.t_fails(format('insert into members (name, church_id) values (%L, %L)', 'Intruso', cb), 'row-level security', 'cria membro na outra igreja');
    perform pg_temp.t_fails(format('insert into transactions (type, amount, church_id) values (%L, 1, %L)', 'entrada', cb), null, 'cria transação na outra igreja');
    perform pg_temp.t_eq(pg_temp.t_affected(format('update church_profiles set name = %L where id = %L', 'Hack', cb)), 0, 'altera perfil da outra igreja');

    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select name from members where church_id = cb), 'Membro B', 'membro continua igual');
    perform pg_temp.t_eq((select count(*)::int from visitors where church_id = cb), 1, 'visitante continua lá');
end`);

    dbTest("Sem igreja preenchida, o registro vai para a igreja de quem está logado", `
declare pa uuid; ca uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    ca := pg_temp.t_church_of(pa);
    perform pg_temp.t_as(pa);
    insert into members (name) values ('Novo membro ' || ca);
    insert into visitors (name, visit_date) values ('Novo visitante ' || ca, current_date);
    insert into ministries (name) values ('Novo ministério ' || ca);
    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select church_id from members where name = 'Novo membro ' || ca), ca, 'membro');
    perform pg_temp.t_eq((select church_id from visitors where name = 'Novo visitante ' || ca), ca, 'visitante');
    perform pg_temp.t_eq((select church_id from ministries where name = 'Novo ministério ' || ca), ca, 'ministério');
end`);

    dbTest("Igrejas diferentes podem ter ministérios com o mesmo nome", `
declare pa uuid; pb uuid; nome text := 'Louvor ' || gen_random_uuid();
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    perform pg_temp.t_as(pa);
    perform pg_temp.t_works(format('insert into ministries (name) values (%L)', nome), 'igreja A cria o ministério');
    perform pg_temp.t_as(pb);
    perform pg_temp.t_works(format('insert into ministries (name) values (%L)', nome), 'igreja B cria um ministério com o mesmo nome');
    perform pg_temp.t_fails(format('insert into ministries (name) values (%L)', nome), 'ministries_church_name_unique', 'mas não repete o nome dentro da mesma igreja');
    perform pg_temp.t_fails(format('insert into ministries (name) values (%L)', upper(nome) || '  '), 'ministries_church_name_unique', 'nem com maiúsculas ou espaços');
end`);

    dbTest("Visitante sem login (anon) não lê nenhuma tabela da igreja", `
declare pa uuid; ca uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    ca := pg_temp.t_church_of(pa);
    insert into members (name, church_id) values ('Membro', ca);
    insert into transactions (type, amount, church_id) values ('entrada', 10, ca);
    perform pg_temp.t_anon();
    perform pg_temp.t_eq(pg_temp.t_visible('select 1 from members'), 0, 'membros');
    perform pg_temp.t_eq(pg_temp.t_visible('select 1 from transactions'), 0, 'transações');
    perform pg_temp.t_eq(pg_temp.t_visible('select 1 from church_profiles'), 0, 'igrejas');
    perform pg_temp.t_eq(pg_temp.t_visible('select 1 from church_users'), 0, 'usuários');
    perform pg_temp.t_eq(pg_temp.t_visible('select 1 from church_invites'), 0, 'convites');
end`);
});
