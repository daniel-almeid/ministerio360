// Mensagens de login, cadastro e senha em português.
// O Supabase devolve os erros em inglês ("Invalid login credentials"...);
// aqui eles viram frases que o usuário entende. Mesmo texto do app (src/shared/utils/authErrors.ts).

type AuthLikeError = { code?: string; message?: string; status?: number } | null | undefined;

const BY_CODE: Record<string, string> = {
    invalid_credentials: "E-mail ou senha incorretos.",
    email_not_confirmed: "Confirme seu e-mail antes de entrar. Procure a mensagem que enviamos (veja também o spam).",
    user_not_found: "Não encontramos uma conta com este e-mail.",
    user_already_exists: "Já existe uma conta com este e-mail. Entre com ela ou use outro e-mail.",
    email_exists: "Já existe uma conta com este e-mail. Entre com ela ou use outro e-mail.",
    weak_password: "A senha é fraca. Use pelo menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.",
    same_password: "A nova senha precisa ser diferente da senha atual.",
    email_address_invalid: "Informe um e-mail válido.",
    validation_failed: "Confira os dados informados.",
    over_email_send_rate_limit: "Muitos e-mails enviados em pouco tempo. Aguarde alguns minutos e tente de novo.",
    over_request_rate_limit: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.",
    signup_disabled: "Novos cadastros estão desativados no momento.",
    user_banned: "Esta conta está bloqueada. Fale com o suporte.",
    session_expired: "Sua sessão expirou. Entre novamente.",
    session_not_found: "Sua sessão expirou. Entre novamente.",
    refresh_token_not_found: "Sua sessão expirou. Entre novamente.",
    otp_expired: "O link expirou. Peça um novo.",
    reauthentication_needed: "Por segurança, entre novamente antes de trocar a senha.",
};

// Quando o erro vem sem código (versões antigas), reconhece pelo texto em inglês
const BY_TEXT: [RegExp, string][] = [
    [/invalid login credentials|invalid (email or )?password/i, BY_CODE.invalid_credentials],
    [/email not confirmed/i, BY_CODE.email_not_confirmed],
    [/user not found/i, BY_CODE.user_not_found],
    [/already (been )?registered|already exists/i, BY_CODE.user_already_exists],
    [/password should be|password is (too )?weak|weak password/i, BY_CODE.weak_password],
    [/should be different from the old password/i, BY_CODE.same_password],
    [/unable to validate email|invalid email|email address .* is invalid/i, BY_CODE.email_address_invalid],
    [/rate limit|too many requests|security purposes/i, BY_CODE.over_request_rate_limit],
    [/signups? not allowed|signup is disabled/i, BY_CODE.signup_disabled],
    [/jwt expired|session (expired|missing)|refresh token/i, BY_CODE.session_expired],
    [/link is invalid or has expired|token has expired/i, BY_CODE.otp_expired],
    [/network request failed|failed to fetch|fetch failed|networkerror|load failed/i, "Sem conexão com a internet. Verifique e tente de novo."],
];

export function authErrorMessage(err: AuthLikeError, fallback = "Não foi possível concluir. Tente novamente."): string {
    if (!err) return fallback;
    if (err.code && BY_CODE[err.code]) return BY_CODE[err.code];
    const text = err.message ?? "";
    for (const [re, msg] of BY_TEXT) if (re.test(text)) return msg;
    if (err.status === 429) return BY_CODE.over_request_rate_limit;
    return fallback;
}
