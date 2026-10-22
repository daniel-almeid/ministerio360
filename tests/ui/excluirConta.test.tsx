// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ href, children }: any) => <a href={href}>{children}</a> }));

import ExcluirContaPage from "@/app/(public)/excluir-conta/page";

let respostas: { status: number; json: any }[] = [];
let enviados: any[] = [];

beforeEach(() => {
    respostas = [];
    enviados = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
        enviados.push(JSON.parse(String(init.body)));
        const r = respostas.shift() ?? { status: 500, json: {} };
        return new Response(JSON.stringify(r.json), { status: r.status });
    }));
});

const preview = (over: Record<string, unknown> = {}) => ({
    mode: "delete_church", church_name: "Igreja Central", successor_name: null, other_users: 2, has_subscription: true, ...over,
});

async function conferir(user: ReturnType<typeof userEvent.setup>, p: Record<string, unknown>) {
    respostas.push({ status: 200, json: { preview: p } });
    render(<ExcluirContaPage />);
    await user.type(screen.getAllByRole("textbox")[0], "pastor@igreja.com");
    await user.type(document.querySelector('input[type="password"]')!, "certa");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
}

describe("Página de excluir conta", () => {
    it("titular sozinho: avisa que tudo será apagado, assinatura cancelada e outros usuários perdem acesso", async () => {
        const user = userEvent.setup();
        await conferir(user, preview());
        expect(enviados[0]).toEqual({ email: "pastor@igreja.com", password: "certa" }); // só confere
        expect(screen.getByText(/serão apagados/)).toBeInTheDocument();
        expect(screen.getByText("A assinatura será cancelada.")).toBeInTheDocument();
        expect(screen.getByText(/Os outros 2 usuários/)).toBeInTheDocument();
    });

    it("titular com outro Pastor: diz para quem a igreja vai", async () => {
        const user = userEvent.setup();
        await conferir(user, preview({ mode: "transfer", successor_name: "Pastor João" }));
        expect(screen.getByText("Pastor João")).toBeInTheDocument();
        expect(screen.getByText(/A assinatura continua ativa/)).toBeInTheDocument();
        expect(screen.queryByText(/serão apagados/)).toBeNull();
    });

    it("convidado: só a conta dele", async () => {
        const user = userEvent.setup();
        await conferir(user, preview({ mode: "user_only", other_users: 0, has_subscription: false }));
        expect(screen.getByText(/continuam para os outros usuários/)).toBeInTheDocument();
    });

    it("exige digitar EXCLUIR e envia a confirmação com o modo conferido", async () => {
        const user = userEvent.setup();
        await conferir(user, preview({ mode: "transfer", successor_name: "Pastor João" }));
        await user.click(screen.getByRole("button", { name: "Excluir permanentemente" }));
        expect(screen.getByText('Digite "EXCLUIR" para confirmar.')).toBeInTheDocument();
        expect(enviados).toHaveLength(1);

        respostas.push({ status: 200, json: { success: true, mode: "transfer" } });
        await user.type(screen.getByRole("textbox"), "excluir");
        await user.click(screen.getByRole("button", { name: "Excluir permanentemente" }));
        expect(enviados[1]).toEqual({ email: "pastor@igreja.com", password: "certa", confirm: true, mode: "transfer" });
        expect(await screen.findByText(/transferida para o outro Pastor/)).toBeInTheDocument();
    });

    it("senha errada mostra o erro e não avança", async () => {
        const user = userEvent.setup();
        respostas.push({ status: 401, json: { error: "E-mail ou senha incorretos" } });
        render(<ExcluirContaPage />);
        await user.type(screen.getAllByRole("textbox")[0], "pastor@igreja.com");
        await user.type(document.querySelector('input[type="password"]')!, "errada");
        await user.click(screen.getByRole("button", { name: "Continuar" }));
        expect(await screen.findByText("E-mail ou senha incorretos")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    });

    it("situação mudou: mostra a nova explicação e o erro", async () => {
        const user = userEvent.setup();
        await conferir(user, preview());
        respostas.push({ status: 409, json: { error: "A situação da sua igreja mudou.", preview: preview({ mode: "transfer", successor_name: "Pastora Ana" }) } });
        await user.type(screen.getByRole("textbox"), "EXCLUIR");
        await user.click(screen.getByRole("button", { name: "Excluir permanentemente" }));
        expect(await screen.findByText("A situação da sua igreja mudou.")).toBeInTheDocument();
        expect(screen.getByText("Pastora Ana")).toBeInTheDocument();
    });
});
