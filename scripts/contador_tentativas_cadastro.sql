-- Contador de tentativas de pagamento no cadastro (sem login)
-- Usado por app/api/pagarme/create-subscription/route.ts
-- Rodar no SQL Editor do Supabase ANTES de publicar o site com essa rota.
-- Para desfazer: desfazer_contador_tentativas_cadastro.sql (depois de voltar o site).
--
-- Soma 1 em app_metadata.signup_payment_attempts numa única operação, só se
-- ainda estiver abaixo do limite. Pedidos ao mesmo tempo esperam um pelo outro,
-- então o limite não é furado. As outras chaves (church_id, plan_slug...) ficam.
-- Devolve o novo total, ou null se o limite já foi atingido (ou a conta não existe).

create or replace function public.claim_signup_payment_attempt(p_user_id uuid, p_max int)
returns int
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $function$
declare
    v_attempts int;
begin
    update auth.users
       set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
             || jsonb_build_object(
                    'signup_payment_attempts',
                    coalesce((raw_app_meta_data->>'signup_payment_attempts')::int, 0) + 1
                )
     where id = p_user_id
       and coalesce((raw_app_meta_data->>'signup_payment_attempts')::int, 0) < p_max
    returning (raw_app_meta_data->>'signup_payment_attempts')::int into v_attempts;

    return v_attempts;
end;
$function$;

-- Só o servidor (service_role) pode chamar
revoke all on function public.claim_signup_payment_attempt(uuid, int) from public, anon, authenticated;
grant execute on function public.claim_signup_payment_attempt(uuid, int) to service_role;
