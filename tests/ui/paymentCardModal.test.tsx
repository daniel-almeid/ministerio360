// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PaymentCardModal from "@/app/(protected)/planos/components/paymentCardModal";

function abrir(props: Partial<React.ComponentProps<typeof PaymentCardModal>> = {}) {
    const onSubmit = vi.fn(async () => {});
    const onClose = vi.fn();
    render(
        <PaymentCardModal open planName="Premium Anual" price="R$ 699,00/ano" totalCents={69900} maxInstallments={12} onClose={onClose} onSubmit={onSubmit} {...props} />,
    );
    return { onSubmit, onClose, user: userEvent.setup() };
}

const campo = (p: string) => screen.getByPlaceholderText(p) as HTMLInputElement;

async function preencher(user: ReturnType<typeof userEvent.setup>) {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ erro: true }))));
    await user.type(campo("Número do cartão"), "4111111111111111");
    await user.type(campo("Nome impresso no cartão"), "maria souza");
    await user.type(campo("MM"), "12");
    await user.type(campo("AA"), "30");
    await user.type(campo("CVV"), "123");
    await user.type(campo("CPF ou CNPJ"), "12345678909");
    await user.type(campo("DDD"), "11");
    await user.type(campo("Telefone"), "999998888");
    await user.type(campo("CEP"), "01001000");
    await user.type(campo("Rua"), "Rua das Flores");
    await user.type(campo("Número"), "10");
    await user.type(campo("Cidade"), "São Paulo");
    await user.type(campo("UF"), "sp");
}

describe("Formulário de pagamento", () => {
    it("fechado não mostra nada", () => {
        const { container } = render(<PaymentCardModal open={false} planName="x" price="x" onClose={() => {}} onSubmit={async () => {}} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("mostra plano e preço", () => {
        abrir();
        expect(screen.getByText("Assinar Premium Anual")).toBeInTheDocument();
        expect(screen.getByText("R$ 699,00/ano")).toBeInTheDocument();
    });

    it("anual: oferece de 1x (à vista) até 12x com o valor de cada parcela", () => {
        abrir();
        const opcoes = screen.getAllByRole("option").map((o) => o.textContent?.replace(/\s/g, " "));
        expect(opcoes).toHaveLength(12);
        expect(opcoes[0]).toBe("À vista · R$ 699,00");
        expect(opcoes[11]).toBe("12x de R$ 58,25");
    });

    it("mensal: não mostra parcelas", () => {
        abrir({ maxInstallments: 1, totalCents: 6990 });
        expect(screen.queryByRole("combobox")).toBeNull();
    });

    it("aplica as máscaras (cartão, CPF, CNPJ, validade, nome, UF)", async () => {
        const { user } = abrir();
        await user.type(campo("Número do cartão"), "4111abc2222.3333-4444");
        expect(campo("Número do cartão").value).toBe("4111 2222 3333 4444");
        expect(campo("Nome impresso no cartão")).toHaveFocus(); // 16 dígitos: pula para o nome
        await user.type(campo("CPF ou CNPJ"), "12345678909");
        expect(campo("CPF ou CNPJ").value).toBe("123.456.789-09");
        await user.clear(campo("CPF ou CNPJ"));
        await user.type(campo("CPF ou CNPJ"), "12345678000199");
        expect(campo("CPF ou CNPJ").value).toBe("12.345.678/0001-99");
        await user.type(campo("MM"), "1a23");
        expect(campo("MM").value).toBe("12");
        await user.type(campo("Nome impresso no cartão"), "maria");
        expect(campo("Nome impresso no cartão").value).toBe("MARIA");
        await user.type(campo("UF"), "spx");
        expect(campo("UF").value).toBe("SP");
    });

    it("não envia com campos obrigatórios vazios", async () => {
        const { user, onSubmit } = abrir();
        await user.type(campo("Número do cartão"), "4111111111111111");
        await user.click(screen.getByRole("button", { name: "Confirmar assinatura" }));
        expect(screen.getByText("Preencha todos os campos obrigatórios para continuar.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("envia os dados com as parcelas escolhidas", async () => {
        const { user, onSubmit } = abrir();
        await preencher(user);
        await user.selectOptions(screen.getByRole("combobox"), "10");
        await user.click(screen.getByRole("button", { name: "Confirmar assinatura" }));
        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                number: "4111 1111 1111 1111",
                holderName: "MARIA SOUZA",
                document: "123.456.789-09",
                zipCode: "01001-000",
                state: "SP",
                installments: "10",
            }),
        );
    });

    it("mostra o erro do pagamento e libera o botão de novo", async () => {
        const { user } = abrir({ onSubmit: vi.fn(async () => { throw new Error("Cartão recusado pela operadora."); }) });
        await preencher(user);
        await user.click(screen.getByRole("button", { name: "Confirmar assinatura" }));
        expect(await screen.findByText("Cartão recusado pela operadora.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Confirmar assinatura" })).toBeEnabled();
    });

    it("CEP completo preenche o endereço sozinho", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" })));
        vi.stubGlobal("fetch", fetchMock);
        const { user } = abrir();
        await user.type(campo("CEP"), "01001000");
        expect(campo("CEP").value).toBe("01001-000");
        await waitFor(() => expect(campo("Rua").value).toBe("Praça da Sé"));
        expect(fetchMock).toHaveBeenCalledWith("https://viacep.com.br/ws/01001000/json/");
        expect(campo("Bairro").value).toBe("Sé");
        expect(campo("UF").value).toBe("SP");
        vi.unstubAllGlobals();
    });

    it("CEP não encontrado deixa preencher à mão", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ erro: true }))));
        const { user } = abrir();
        await user.type(campo("CEP"), "99999999");
        await user.type(campo("Rua"), "Rua Nova");
        expect(campo("Rua").value).toBe("Rua Nova");
        vi.unstubAllGlobals();
    });

    it("botão X fecha", async () => {
        const { user, onClose } = abrir();
        await user.click(screen.getAllByRole("button")[0]);
        expect(onClose).toHaveBeenCalled();
    });
});
