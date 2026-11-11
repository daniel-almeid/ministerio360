import { describe, expect, it, vi } from "vitest";

// Só as funções de texto são testadas aqui; o banco não é usado
vi.mock("@/lib/supabaseClient", () => ({ supabase: {} }));
import { CONFIRM_BASE_URL, confirmLink, firstName, formatScaleDate, groupMessage, personMessage } from "@/app/(protected)/agenda/whatsapp/scaleMessages";
import { formatRespondedAt } from "@/app/(protected)/agenda/whatsapp/scaleShareService";
import { copyText, toWhatsAppNumber, whatsappChatUrl, whatsappShareUrl } from "@/lib/whatsapp";

describe("Confirmação de presença", () => {
    it("link aponta para a página pública do site", () => {
        expect(CONFIRM_BASE_URL).toBe("https://ministerio360.vercel.app/confirmar/");
        expect(confirmLink("abc")).toBe("https://ministerio360.vercel.app/confirmar/abc");
    });

    it("mostra quando respondeu no horário de Brasília", () => {
        expect(formatRespondedAt("2026-10-20T22:15:00Z")).toBe("20/10 às 19:15");
        expect(formatRespondedAt(null)).toBe("");
        expect(formatRespondedAt("não é data")).toBe("");
    });
});

describe("WhatsApp no computador", () => {
    it("monta o número com DDI do Brasil", () => {
        expect(toWhatsAppNumber("(11) 98888-1020")).toBe("5511988881020");
        expect(toWhatsAppNumber("+1 415 555 0100")).toBe("14155550100");
        expect(toWhatsAppNumber("123")).toBeNull();
        expect(toWhatsAppNumber(null)).toBeNull();
    });

    it("links do WhatsApp levam a mensagem pronta", () => {
        expect(whatsappChatUrl("5511988881020", "Olá, tudo bem?")).toBe(
            "https://wa.me/5511988881020?text=Ol%C3%A1%2C%20tudo%20bem%3F"
        );
        expect(whatsappShareUrl("a b")).toBe("https://wa.me/?text=a%20b");
    });

    it("copiar avisa quando o navegador não deixa", async () => {
        expect(await copyText("x")).toBe(false);
    });
});

describe("Mensagens da escala no WhatsApp", () => {
    const escala = {
        date: "2026-10-25T19:00:00",
        event: "Culto de domingo",
        responsible: "  Pr. João  ",
        byMinistry: [
            { ministry: "Louvor", members: ["Ana", "Carlos"] },
            { ministry: "Mídia", members: [] },
        ],
    };

    it("data com dia da semana, sem erro de fuso", () => {
        expect(formatScaleDate("2026-10-25T23:30:00")).toBe("domingo, 25/10/2026");
        expect(formatScaleDate("2026-10-21")).toBe("quarta-feira, 21/10/2026");
        expect(firstName("  mARIA da silva ")).toBe("Maria");
        expect(firstName("")).toBe("");
    });

    it("mensagem individual com link de confirmação", () => {
        const msg = personMessage(escala as never, { name: "ana souza", ministries: ["Louvor", "Mídia"], token: "tok-1" } as never, "Igreja Central");
        expect(msg).toContain("Olá, Ana! 👋");
        expect(msg).toContain("📅 domingo, 25/10/2026");
        expect(msg).toContain("🙌 Ministério: Louvor e Mídia");
        expect(msg).toContain("👤 Responsável: Pr. João");
        expect(msg).toContain("https://ministerio360.vercel.app/confirmar/tok-1");
        expect(msg).toContain("_Igreja Central_");
    });

    it("sem link (escala antiga) pede para avisar o responsável; nome provisório da igreja não aparece", () => {
        const msg = personMessage(escala as never, { name: "Carlos", ministries: ["Louvor"], token: null } as never, "Carregando...");
        expect(msg).not.toContain("confirmar/");
        expect(msg).toContain("avise o responsável");
        expect(msg).not.toContain("Carregando");
    });

    it("mensagem do grupo lista todos os ministérios", () => {
        const msg = groupMessage(escala as never, "Igreja Central");
        expect(msg).toContain("📋 *Escala – Culto de domingo*");
        expect(msg).toContain("*Louvor*\n• Ana\n• Carlos");
        expect(msg).toContain("*Mídia*\n• (ninguém escalado)");
        expect(msg).toContain("_Igreja Central_");
    });
});
