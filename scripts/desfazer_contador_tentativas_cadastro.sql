-- Desfaz contador_tentativas_cadastro.sql
-- Rodar no SQL Editor do Supabase SÓ DEPOIS de voltar o site para a versão sem
-- essa função (senão o pagamento no cadastro passa a dar "Erro interno").
--
-- O valor signup_payment_attempts já gravado nas contas fica onde está: não atrapalha
-- nada. Se quiser limpar também, rode a parte comentada no fim.

drop function if exists public.claim_signup_payment_attempt(uuid, int);

-- update auth.users
--    set raw_app_meta_data = raw_app_meta_data - 'signup_payment_attempts'
--  where raw_app_meta_data ? 'signup_payment_attempts';
