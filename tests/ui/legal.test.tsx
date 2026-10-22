// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a> }));

import TermosPage from "@/app/(public)/termos/page";
import PrivacidadePage from "@/app/(public)/privacidade/page";
import ConsentCheckbox from "@/components/legal/consentCheckbox";
import { LEGAL, legalAcceptance } from "@/lib/legal";

describe("Termos de Uso", () => {
    it("tem título, versão, resumo e o sumário aponta para cada seção", () => {
        const { container } = render(<TermosPage />);
        expect(screen.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`Versão ${LEGAL.VERSION}`))).toBeInTheDocument();
        expect(screen.getByText("Em resumo")).toBeInTheDocument();
        const ids = [...container.querySelectorAll("section[id]")].map((s) => s.id);
        expect(ids.length).toBeGreaterThan(10);
        for (const id of ids) expect(container.querySelector(`a[href="#${id}"]`)).not.toBeNull();
    });

    it("descreve as regras reais: renovação, cancelamento, 7 dias, tolerância de 1 dia e exclusão", () => {
        render(<TermosPage />);
        expect(screen.getByText(/Renovação automática:/)).toBeInTheDocument();
        expect(screen.getByText(/Cancelar a qualquer momento:/)).toBeInTheDocument();
        expect(screen.getByText(/7 \(sete\) dias/)).toBeInTheDocument();
        expect(screen.getByText(/em até 1 dia após o vencimento/)).toBeInTheDocument();
        expect(screen.getByText(/Titular sem outro Pastor ativo:/)).toBeInTheDocument();
        expect(screen.getByText(/foro do domicílio do Cliente/)).toBeInTheDocument();
    });

    it("mostra a tabela de preços a partir do catálogo de planos", () => {
        render(<TermosPage />);
        const tabela = screen.getByRole("table");
        expect(within(tabela).getByText("Padrão")).toBeInTheDocument();
        expect(within(tabela).getByText("Premium+")).toBeInTheDocument();
        expect(within(tabela).getByText("Ilimitados")).toBeInTheDocument();
    });
});

describe("Política de Privacidade", () => {
    it("cobre papéis, dados sensíveis, crianças, compartilhamento, transferência e direitos", () => {
        render(<PrivacidadePage />);
        expect(screen.getByRole("heading", { level: 1, name: "Política de Privacidade" })).toBeInTheDocument();
        expect(screen.getByText(/A igreja é controladora/)).toBeInTheDocument();
        expect(screen.getByText(/Dados sensíveis\./)).toBeInTheDocument();
        expect(screen.getByText(/Crianças e adolescentes\./)).toBeInTheDocument();
        expect(screen.getByText("Supabase")).toBeInTheDocument();
        expect(screen.getByText("Pagar.me")).toBeInTheDocument();
        expect(screen.getByText(/fora do Brasil/)).toBeInTheDocument();
        expect(screen.getByText(/art\. 18 da LGPD/)).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: LEGAL.EMAIL }).length).toBeGreaterThan(0);
    });
});

describe("Aceite dos termos", () => {
    it("caixa com links para os dois documentos", async () => {
        const onChange = vi.fn();
        render(<ConsentCheckbox checked={false} onChange={onChange} />);
        expect(screen.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/termos");
        expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
        await userEvent.click(screen.getByRole("checkbox"));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("grava a versão e a data do aceite", () => {
        const a = legalAcceptance();
        expect(a.terms_version).toBe(LEGAL.VERSION);
        expect(new Date(a.terms_accepted_at).toString()).not.toBe("Invalid Date");
    });
});
