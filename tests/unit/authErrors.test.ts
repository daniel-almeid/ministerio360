import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/lib/authErrors";

describe("Mensagens de login e cadastro em português", () => {
    it("pelo código do Supabase", () => {
        expect(authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" })).toBe("E-mail ou senha incorretos.");
        expect(authErrorMessage({ code: "email_not_confirmed" })).toMatch(/^Confirme seu e-mail/);
        expect(authErrorMessage({ code: "weak_password" })).toMatch(/^A senha é fraca/);
        expect(authErrorMessage({ code: "over_email_send_rate_limit" })).toMatch(/Aguarde alguns minutos/);
    });

    it("pelo texto em inglês quando não vem código", () => {
        expect(authErrorMessage({ message: "Invalid login credentials" })).toBe("E-mail ou senha incorretos.");
        expect(authErrorMessage({ message: "User already registered" })).toMatch(/^Já existe uma conta/);
        expect(authErrorMessage({ message: "Password should be at least 6 characters." })).toMatch(/^A senha é fraca/);
        expect(authErrorMessage({ message: "For security purposes, you can only request this after 42 seconds." })).toMatch(/Muitas tentativas/);
        expect(authErrorMessage({ message: "Network request failed" })).toBe("Sem conexão com a internet. Verifique e tente de novo.");
        expect(authErrorMessage({ message: "Too many", status: 429 })).toMatch(/Muitas tentativas/);
    });

    it("nunca mostra inglês: erro desconhecido vira a mensagem padrão", () => {
        expect(authErrorMessage({ message: "Something odd happened" })).toBe("Não foi possível concluir. Tente novamente.");
        expect(authErrorMessage({ message: "Something odd" }, "Não foi possível entrar.")).toBe("Não foi possível entrar.");
        expect(authErrorMessage(null)).toBe("Não foi possível concluir. Tente novamente.");
    });
});
