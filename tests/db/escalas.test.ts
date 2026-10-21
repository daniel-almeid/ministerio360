import { describe } from "vitest";
import { dbTest } from "./harness";

// Escalas: líder só mexe nos ministérios que lidera; confirmação de presença por link
describe("Escalas", () => {
    dbTest("Líder cria e edita escalas só dos ministérios que lidera", `
declare p uuid; c uuid; l uuid; m1 uuid; m2 uuid; mem uuid; s1 uuid; s2 uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m1;
    insert into ministries (name, church_id) values ('Mídia ' || gen_random_uuid(), c) returning id into m2;
    insert into members (name, church_id) values ('Membro ' || c, c) returning id into mem;
    insert into scales (event_name, date, ministries, church_id)
        values ('Escala da Mídia', now() + interval '3 days', jsonb_build_array(jsonb_build_object('id', m2)), c)
        returning id into s2;
    l := pg_temp.t_user(p, 'lider', null, array[m1]);

    perform pg_temp.t_as(l);
    perform pg_temp.t_works(format('insert into scales (event_name, date, ministries, church_id) values (%L, now() + interval %L, %L, %L)',
        'Culto', '3 days', jsonb_build_array(jsonb_build_object('id', m1)), c), 'cria escala do próprio ministério');
    perform pg_temp.t_fails(format('insert into scales (event_name, date, ministries, church_id) values (%L, now(), %L, %L)',
        'Outra', jsonb_build_array(jsonb_build_object('id', m2)), c), 'row-level security', 'não cria escala de outro ministério');
    perform pg_temp.t_fails(format('insert into scales (event_name, date, ministries, church_id) values (%L, now(), %L, %L)',
        'Mista', jsonb_build_array(jsonb_build_object('id', m1), jsonb_build_object('id', m2)), c), 'row-level security', 'não cria escala que mistura ministérios');
    perform pg_temp.t_fails(format('insert into scales (event_name, date, ministries, church_id) values (%L, now(), %L, %L)',
        'Vazia', '[]', c), 'row-level security', 'não cria escala sem ministério');

    select id into s1 from scales where event_name = 'Culto' and church_id = c;
    perform pg_temp.t_works(format('insert into scale_assignments (scale_id, ministry_id, member_id, church_id) values (%L, %L, %L, %L)',
        s1, m1, mem, c), 'escala membro no próprio ministério');
    perform pg_temp.t_fails(format('insert into scale_assignments (scale_id, ministry_id, member_id, church_id) values (%L, %L, %L, %L)',
        s2, m2, mem, c), 'row-level security', 'não escala membro em outro ministério');

    perform pg_temp.t_eq(pg_temp.t_count('select 1 from scales'), 2, 'vê todas as escalas da igreja');
    perform pg_temp.t_eq(pg_temp.t_affected(format('update scales set event_name = %L where id = %L', 'Hack', s2)), 0, 'não altera escala de outro ministério');
    perform pg_temp.t_eq(pg_temp.t_remove('scales', format('id = %L', s2)), 0, 'não apaga escala de outro ministério');
    perform pg_temp.t_eq(pg_temp.t_affected(format('update scales set event_name = %L where id = %L', 'Culto editado', s1)), 1, 'altera a própria escala');
end`);

    dbTest("Escalas 'todas' editam qualquer ministério; 'ver' só lê", `
declare p uuid; c uuid; a uuid; v uuid; m uuid; s uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m;
    insert into scales (event_name, date, ministries, church_id)
        values ('Culto', now() + interval '2 days', jsonb_build_array(jsonb_build_object('id', m)), c) returning id into s;
    a := pg_temp.t_user(p, 'lider', '{"membros":"view","visitantes":"none","ministerios":"view","agenda":"edit","escalas":"all","financas":"none"}');
    v := pg_temp.t_user(p, 'secretaria');

    perform pg_temp.t_as(a);
    perform pg_temp.t_eq(pg_temp.t_affected(format('update scales set event_name = %L where id = %L', 'Editado', s)), 1, 'todas: edita escala sem liderar o ministério');

    perform pg_temp.t_as(v);
    perform pg_temp.t_eq(pg_temp.t_count('select 1 from scales'), 1, 'ver: enxerga a escala');
    perform pg_temp.t_eq(pg_temp.t_affected(format('update scales set event_name = %L where id = %L', 'Hack', s)), 0, 'ver: não altera');
end`);

    dbTest("Confirmação de presença pelo link funciona sem login", `
declare p uuid; c uuid; m uuid; mem uuid; s uuid; tok uuid; r json;
begin
    p := pg_temp.t_church('Igreja Confirmação');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m;
    insert into members (name, church_id) values ('joão da silva ' || c, c) returning id into mem;
    insert into scales (event_name, date, ministries, church_id)
        values ('Culto de domingo', now() + interval '3 days', jsonb_build_array(jsonb_build_object('id', m)), c) returning id into s;
    insert into scale_assignments (scale_id, ministry_id, member_id, church_id) values (s, m, mem, c)
        returning response_token into tok;
    perform pg_temp.t_ok(tok is not null, 'cada escalado ganha um link próprio');

    perform pg_temp.t_anon();
    r := public.get_scale_invite(tok);
    perform pg_temp.t_eq((r->>'found')::boolean, true, 'link encontrado');
    perform pg_temp.t_eq(r->>'first_name', 'João', 'mostra só o primeiro nome');
    perform pg_temp.t_eq(r->>'event', 'Culto de domingo', 'mostra o evento');
    perform pg_temp.t_eq((r->>'can_respond')::boolean, true, 'ainda pode responder');

    r := public.respond_scale_invite(tok, 'declined', 'Vou viajar');
    perform pg_temp.t_eq(r->>'status', 'declined', 'recusa registrada');
    perform pg_temp.t_eq(r->>'note', 'Vou viajar', 'motivo registrado');
    r := public.respond_scale_invite(tok, 'confirmed', 'ignorado');
    perform pg_temp.t_eq(r->>'status', 'confirmed', 'pode mudar a resposta');
    perform pg_temp.t_eq(r->>'note', null, 'confirmação não guarda motivo');
    perform pg_temp.t_fails(format('select public.respond_scale_invite(%L, %L, null)', tok, 'talvez'), 'inválida', 'resposta inválida é recusada');
    perform pg_temp.t_eq((public.get_scale_invite(gen_random_uuid())->>'found')::boolean, false, 'link inexistente');
    perform pg_temp.t_eq(pg_temp.t_visible('select 1 from scale_assignments'), 0, 'sem login não lista as escalas');

    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select response_source from scale_assignments where response_token = tok), 'link', 'origem = link');
end`);

    dbTest("Depois do dia da escala o link não aceita mais resposta", `
declare p uuid; c uuid; m uuid; mem uuid; s uuid; tok uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m;
    insert into members (name, church_id) values ('Maria ' || c, c) returning id into mem;
    insert into scales (event_name, date, ministries, church_id)
        values ('Culto passado', now() - interval '2 days', jsonb_build_array(jsonb_build_object('id', m)), c) returning id into s;
    insert into scale_assignments (scale_id, ministry_id, member_id, church_id) values (s, m, mem, c)
        returning response_token into tok;

    perform pg_temp.t_anon();
    perform pg_temp.t_eq((public.get_scale_invite(tok)->>'can_respond')::boolean, false, 'mostra que o prazo acabou');
    perform pg_temp.t_fails(format('select public.respond_scale_invite(%L, %L, null)', tok, 'confirmed'), 'prazo', 'não aceita resposta');
end`);

    dbTest("O link de confirmação não muda quando a escala é editada", `
declare p uuid; c uuid; m uuid; mem uuid; s uuid; tok uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    insert into ministries (name, church_id) values ('Louvor ' || gen_random_uuid(), c) returning id into m;
    insert into members (name, church_id) values ('Ana ' || c, c) returning id into mem;
    insert into scales (event_name, date, ministries, church_id)
        values ('Culto', now() + interval '1 day', jsonb_build_array(jsonb_build_object('id', m)), c) returning id into s;
    insert into scale_assignments (scale_id, ministry_id, member_id, church_id) values (s, m, mem, c)
        returning response_token into tok;
    perform pg_temp.t_as(p);
    perform pg_temp.t_works(format('update scale_assignments set response_token = %L, status = %L where scale_id = %L', gen_random_uuid(), 'confirmed', s), 'Pastor marca presença');
    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select response_token from scale_assignments where scale_id = s), tok, 'token continua o mesmo');
    perform pg_temp.t_eq((select status from scale_assignments where scale_id = s), 'confirmed', 'marcação manual gravada');
end`);
});
