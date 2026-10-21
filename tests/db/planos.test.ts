import { describe } from "vitest";
import { dbTest } from "./harness";

// Planos, cadastro de igreja nova e configuração de cobrança
describe("Planos e cadastro", () => {
    dbTest("Limite de usuários de cada plano", `
begin
    perform pg_temp.t_eq(public.plan_user_limit('free'), 1, 'grátis');
    perform pg_temp.t_eq(public.plan_user_limit('standard'), 3, 'padrão');
    perform pg_temp.t_eq(public.plan_user_limit('premium_basic'), 5, 'premium');
    perform pg_temp.t_eq(public.plan_user_limit('premium'), null::int, 'premium+ ilimitado');
    perform pg_temp.t_eq(public.plan_user_limit('qualquer'), 1, 'desconhecido vale como grátis');
end`);

    dbTest("Tabela de planos está configurada para cobrança mensal e anual", `
declare r record;
begin
    for r in select * from plans where plan_slug in ('standard', 'premium_basic', 'premium') loop
        perform pg_temp.t_ok(r.active, r.plan_slug || ' ativo');
        perform pg_temp.t_ok(r.pagarme_plan_id like 'plan_%', r.plan_slug || ' tem plano mensal no Pagar.me');
        perform pg_temp.t_ok(r.pagarme_yearly_plan_id like 'plan_%', r.plan_slug || ' tem plano anual no Pagar.me');
        perform pg_temp.t_eq(r.price_yearly_cents, r.price_cents * 10, r.plan_slug || ' anual = 10 mensalidades');
        perform pg_temp.t_eq(r.yearly_max_installments, 12, r.plan_slug || ' anual em até 12x');
    end loop;
    perform pg_temp.t_eq((select price_cents from plans where plan_slug = 'standard'), 3990, 'Padrão R$ 39,90');
    perform pg_temp.t_eq((select price_cents from plans where plan_slug = 'premium_basic'), 6990, 'Premium R$ 69,90');
    perform pg_temp.t_eq((select price_cents from plans where plan_slug = 'premium'), 9990, 'Premium+ R$ 99,90');
end`);

    dbTest("Cadastro de igreja nova: dono vira Pastor com acesso total", `
declare u uuid; c uuid; cu church_users%rowtype;
begin
    u := pg_temp.t_signup('dono.' || gen_random_uuid() || '@m360.test', '{"church_name":"Igreja Nova","plan_slug":"standard"}');
    select id into c from church_profiles where user_id = u;
    perform pg_temp.t_ok(c is not null, 'igreja criada');
    perform pg_temp.t_eq((select plan_slug from church_profiles where id = c), 'standard', 'com o plano escolhido');
    perform pg_temp.t_eq((select subscription_active from church_profiles where id = c), false, 'assinatura começa inativa até pagar');
    perform pg_temp.t_eq((select billing_cycle from church_profiles where id = c), 'monthly', 'ciclo padrão mensal');
    select * into cu from church_users where user_id = u;
    perform pg_temp.t_eq(cu.church_id, c, 'vínculo criado');
    perform pg_temp.t_eq(cu.role, 'pastor', 'como Pastor');
    perform pg_temp.t_eq((select raw_app_meta_data->>'church_id' from auth.users where id = u), c::text, 'acesso (token) já aponta para a igreja');
end`);

    dbTest("Cadastro com plano inexistente vira Grátis", `
declare u uuid;
begin
    u := pg_temp.t_signup('x.' || gen_random_uuid() || '@m360.test', '{"church_name":"Igreja","plan_slug":"diamante"}');
    perform pg_temp.t_eq((select plan_slug from church_profiles where user_id = u), 'free', 'plano grátis');
end`);

    dbTest("Ciclo de cobrança só aceita mensal ou anual", `
declare p uuid; c uuid;
begin
    p := pg_temp.t_church('Igreja');
    c := pg_temp.t_church_of(p);
    perform pg_temp.t_fails(format('update church_profiles set billing_cycle = %L where id = %L', 'weekly', c), 'billing_cycle', 'semanal recusado');
    perform pg_temp.t_works(format('update church_profiles set billing_cycle = %L where id = %L', 'yearly', c), 'anual aceito');
end`);

    dbTest("Verificação de e-mail já cadastrado (usada no cadastro do app)", `
declare e text := 'Existe.' || gen_random_uuid() || '@M360.test';
begin
    perform pg_temp.t_signup(e, '{"church_name":"Igreja"}');
    perform pg_temp.t_anon();
    perform pg_temp.t_ok(public.email_already_registered(upper(e)), 'acha mesmo com maiúsculas');
    perform pg_temp.t_ok(public.email_already_registered('  ' || lower(e) || '  '), 'acha mesmo com espaços');
    perform pg_temp.t_ok(not public.email_already_registered('ninguem.' || gen_random_uuid() || '@m360.test'), 'e-mail novo');
end`);

    dbTest("Ninguém libera plano de graça: plano e assinatura só mudam pelo pagamento ou pelo Admin", `
declare p uuid; c uuid;
begin
    p := pg_temp.t_church('Igreja', 'free');
    c := pg_temp.t_church_of(p);
    perform pg_temp.t_as(p);
    perform pg_temp.t_fails(format('update church_profiles set plan_slug = %L where id = %L', 'premium', c), 'permission denied', 'Pastor muda o próprio plano');
    perform pg_temp.t_fails(format('update church_profiles set subscription_active = true where id = %L', c), 'permission denied', 'Pastor ativa a assinatura');
    perform pg_temp.t_fails(format('update church_profiles set plan_expires_at = now() + interval %L where id = %L', '10 years', c), 'permission denied', 'Pastor estende a validade');
    perform pg_temp.t_fails(format('update church_profiles set user_id = gen_random_uuid() where id = %L', c), 'permission denied', 'Pastor troca o titular');
    perform pg_temp.t_eq(pg_temp.t_affected(format('update church_profiles set trade_name = %L where id = %L', 'Novo Nome', c)), 1, 'mas pode mudar o nome da igreja');
    perform pg_temp.t_reset();
    perform pg_temp.t_eq((select plan_slug from church_profiles where id = c), 'free', 'plano continua grátis');
end`);
    dbTest("Rotina diária só volta para o Grátis 1 dia depois do vencimento (o Pagar.me cobra às 5h)", `
declare pa uuid; ca uuid; pb uuid; cb uuid; tb uuid; pc uuid; cc uuid;
begin
    pa := pg_temp.t_church('Venceu ontem à noite', 'premium_basic');
    ca := pg_temp.t_church_of(pa);
    pb := pg_temp.t_church('Venceu há mais de 1 dia', 'premium_basic');
    cb := pg_temp.t_church_of(pb);
    tb := pg_temp.t_user(pb, 'tesoureiro');
    pc := pg_temp.t_church('Vence semana que vem', 'standard');
    cc := pg_temp.t_church_of(pc);
    perform pg_temp.t_reset();
    update church_profiles set plan_expires_at = now() - interval '5 hours' where id = ca;
    update church_profiles set plan_expires_at = now() - interval '25 hours' where id = cb;
    update church_profiles set plan_expires_at = now() + interval '7 days' where id = cc;

    perform public.expire_old_plans();

    perform pg_temp.t_eq((select plan_slug from church_profiles where id = ca), 'premium_basic', 'venceu há 5h: continua, aguardando a cobrança');
    perform pg_temp.t_eq((select subscription_active from church_profiles where id = ca), true, 'venceu há 5h: ativa');
    perform pg_temp.t_eq((select plan_slug from church_profiles where id = cb), 'free', 'venceu há 25h sem pagamento: Grátis');
    perform pg_temp.t_eq((select subscription_active from church_profiles where id = cb), false, 'venceu há 25h: inativa');
    perform pg_temp.t_eq((select raw_app_meta_data->>'plan_slug' from auth.users where id = pb), 'free', 'acesso do Pastor atualizado');
    perform pg_temp.t_eq((select raw_app_meta_data->>'plan_slug' from auth.users where id = tb), 'free', 'acesso do tesoureiro também');
    perform pg_temp.t_eq((select plan_slug from church_profiles where id = cc), 'standard', 'ainda não venceu: continua');
    perform pg_temp.t_eq(has_function_privilege('authenticated', 'public.expire_old_plans()', 'execute'), false, 'usuário logado não roda a rotina');
end`);
});
