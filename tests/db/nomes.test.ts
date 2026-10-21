import { describe } from "vitest";
import { dbTest } from "./harness";

// Nomes repetidos: cada igreja é independente; membros homônimos são permitidos (com aviso na tela)
describe("Nomes repetidos", () => {
    dbTest("Dois membros com o mesmo nome na mesma igreja", `
declare pa uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    perform pg_temp.t_as(pa);
    perform pg_temp.t_works($$insert into members (name) values ('Maria Souza')$$, 'primeira Maria');
    perform pg_temp.t_works($$insert into members (name) values ('Maria Souza')$$, 'segunda Maria');
    perform pg_temp.t_eq(pg_temp.t_count($$select 1 from members where name = 'Maria Souza'$$), 2, 'as duas foram cadastradas');
end`);

    dbTest("Igrejas diferentes podem ter membros com o mesmo nome", `
declare pa uuid; pb uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    perform pg_temp.t_as(pa);
    perform pg_temp.t_works($$insert into members (name) values ('João Silva')$$, 'igreja A');
    perform pg_temp.t_as(pb);
    perform pg_temp.t_works($$insert into members (name) values ('João Silva')$$, 'igreja B');
end`);

    dbTest("Aviso de homônimo procura só na própria igreja", `
declare pa uuid; pb uuid; ca uuid; cb uuid; m1 uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    ca := pg_temp.t_church_of(pa);
    cb := pg_temp.t_church_of(pb);
    insert into members (name, church_id) values ('Maria  Souza', ca) returning id into m1;
    insert into members (name, church_id) values ('Pedro Lima', cb);

    perform pg_temp.t_as(pa);
    perform pg_temp.t_eq((select count(*)::int from find_members_by_name('  maria souza ')), 1, 'acha ignorando maiúsculas e espaços');
    perform pg_temp.t_eq((select count(*)::int from find_members_by_name('Maria Souz')), 0, 'nome parecido não conta');
    perform pg_temp.t_eq((select count(*)::int from find_members_by_name('Maria Souza', m1)), 0, 'ao editar, ignora o próprio membro');
    perform pg_temp.t_eq((select count(*)::int from find_members_by_name('Pedro Lima')), 0, 'não acha membro de outra igreja');

    perform pg_temp.t_as(pb);
    perform pg_temp.t_eq((select count(*)::int from find_members_by_name('Maria Souza')), 0, 'igreja B não vê a Maria da igreja A');

    perform pg_temp.t_anon();
    perform pg_temp.t_fails($$select * from find_members_by_name('Maria Souza')$$, 'permission denied', 'sem login não usa');
end`);

    dbTest("Ministério renomeado não pode colidir dentro da igreja, mas pode com outra igreja", `
declare pa uuid; pb uuid; nome text := 'Jovens ' || gen_random_uuid(); outro uuid;
begin
    pa := pg_temp.t_church('Igreja A');
    pb := pg_temp.t_church('Igreja B');
    perform pg_temp.t_as(pb);
    perform pg_temp.t_works(format('insert into ministries (name) values (%L)', nome), 'igreja B tem o nome');
    perform pg_temp.t_as(pa);
    perform pg_temp.t_works(format('insert into ministries (name) values (%L)', nome), 'igreja A também');
    insert into ministries (name) values ('Outro ' || gen_random_uuid()) returning id into outro;
    perform pg_temp.t_fails(format('update ministries set name = %L where id = %L', nome, outro), 'ministries_church_name_unique', 'renomear para um nome já usado na igreja');
end`);
});
