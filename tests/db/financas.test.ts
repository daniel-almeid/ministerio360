import { describe } from "vitest";
import { dbTest } from "./harness";

// Regras de finanças que o banco garante sozinho
describe("Finanças", () => {
    dbTest("Transação sem conta vai para a conta padrão 'Geral' da igreja", `
declare p uuid; c uuid; acc uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    perform pg_temp.t_as(p);
    insert into transactions (type, amount) values ('entrada', 100);
    perform pg_temp.t_reset();
    select id into acc from finance_accounts where church_id = c and is_default;
    perform pg_temp.t_ok(acc is not null, 'conta padrão criada');
    perform pg_temp.t_eq((select name from finance_accounts where id = acc), 'Geral', 'chama Geral');
    perform pg_temp.t_eq((select account_id from transactions where church_id = c), acc, 'transação ligada à conta padrão');
end`);

    dbTest("Não aceita conta, membro ou recorrente de outra igreja", `
declare pa uuid; ca uuid; pb uuid; cb uuid; accb uuid; memb uuid; recb uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    ca := pg_temp.t_church_of(pa);
    pb := pg_temp.t_church('Igreja B');
    cb := pg_temp.t_church_of(pb);
    insert into finance_accounts (name, church_id) values ('Banco B', cb) returning id into accb;
    insert into members (name, church_id) values ('Membro B', cb) returning id into memb;
    insert into recurring_expenses (description, amount, day_of_month, church_id) values ('Aluguel B', 10, 5, cb) returning id into recb;

    perform pg_temp.t_as(pa);
    perform pg_temp.t_fails(format('insert into transactions (type, amount, account_id) values (%L, 1, %L)', 'entrada', accb), 'Conta inválida', 'conta de outra igreja');
    perform pg_temp.t_fails(format('insert into transactions (type, amount, member_id) values (%L, 1, %L)', 'entrada', memb), 'Membro inválido', 'dízimo de membro de outra igreja');
    perform pg_temp.t_fails(format('insert into transactions (type, amount, recurring_id) values (%L, 1, %L)', 'saida', recb), 'recorrente inválida', 'recorrente de outra igreja');
    perform pg_temp.t_fails(format('insert into recurring_expenses (description, amount, day_of_month, account_id) values (%L, 1, 1, %L)', 'X', accb), 'Conta inválida', 'recorrente com conta de outra igreja');
end`);

    dbTest("Transferência só entre contas da própria igreja", `
declare pa uuid; pb uuid; cb uuid; a1 uuid; a2 uuid; bx uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    cb := pg_temp.t_church_of(pb);
    insert into finance_accounts (name, church_id) values ('Banco B', cb) returning id into bx;
    perform pg_temp.t_as(pa);
    insert into finance_accounts (name) values ('Caixa') returning id into a1;
    insert into finance_accounts (name) values ('Banco') returning id into a2;
    perform pg_temp.t_works(format('insert into finance_transfers (from_account_id, to_account_id, amount) values (%L, %L, 50)', a1, a2), 'transfere entre contas próprias');
    perform pg_temp.t_fails(format('insert into finance_transfers (from_account_id, to_account_id, amount) values (%L, %L, 50)', a1, bx), 'Conta inválida', 'transfere para outra igreja');
end`);

    dbTest("A conta padrão não pode ser apagada", `
declare p uuid; c uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    perform pg_temp.t_as(p);
    insert into transactions (type, amount) values ('entrada', 1);
    perform pg_temp.t_fails(format('select pg_temp.t_remove(%L, %L)', 'finance_accounts', 'is_default'), 'conta padrão', 'apagar a conta Geral');
    insert into finance_accounts (name) values ('Extra');
    perform pg_temp.t_eq(pg_temp.t_remove('finance_accounts', $q$name = 'Extra'$q$), 1, 'outras contas podem ser apagadas');
end`);

    dbTest("Uma igreja tem só uma conta padrão e não repete nome de conta", `
declare p uuid; c uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    perform pg_temp.t_as(p);
    insert into transactions (type, amount) values ('entrada', 1);
    perform pg_temp.t_fails($q$insert into finance_accounts (name, is_default) values ('Outra padrão', true)$q$, null, 'segunda conta padrão');
    insert into finance_accounts (name) values ('Banco');
    perform pg_temp.t_fails($q$insert into finance_accounts (name) values ('Banco')$q$, null, 'nome repetido');
end`);
});
