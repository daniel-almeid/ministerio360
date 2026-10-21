-- Gerado por scripts/criar-planos-pagarme.mjs
-- Conta Pagar.me: PRODUÇÃO · 21/10/2026, 09:58:26
-- Rodar no SQL Editor do Supabase DEPOIS do etapa4a_planos.sql

update public.plans set
    price_monthly = 39.90, price_cents = 3990, duration_days = 30,
    price_yearly_cents = 39900, yearly_max_installments = 12,
    pagarme_plan_id = 'plan_QD2lJ2McKhQOlaW9', pagarme_yearly_plan_id = 'plan_BlGZWriwWtLx0L71', active = true
where plan_slug = 'standard';

update public.plans set
    price_monthly = 69.90, price_cents = 6990, duration_days = 30,
    price_yearly_cents = 69900, yearly_max_installments = 12,
    pagarme_plan_id = 'plan_rPW0VR2IaQub0Z4z', pagarme_yearly_plan_id = 'plan_GoXj0yefzPSv03Qy', active = true
where plan_slug = 'premium_basic';

update public.plans set
    price_monthly = 99.90, price_cents = 9990, duration_days = 30,
    price_yearly_cents = 99900, yearly_max_installments = 12,
    pagarme_plan_id = 'plan_4rnR6d3slnIGYVz5', pagarme_yearly_plan_id = 'plan_RL1Y5RNHyOsr540X', active = true
where plan_slug = 'premium';
