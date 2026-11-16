import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cleanUrl } from "@/lib/analytics";

describe("estatística do site sem dados pessoais", () => {
    it("tira o código do convite e da confirmação do endereço", () => {
        expect(cleanUrl("https://ministerio360.vercel.app/convite/abc123XYZ").path).toBe("/convite/:token");
        expect(cleanUrl("https://ministerio360.vercel.app/confirmar/tok-999/ok").path).toBe("/confirmar/:token/ok");
    });

    it("troca ids por :id", () => {
        expect(cleanUrl("https://x.app/membros/2f1c3a9e-1b2c-4d5e-8f90-123456789abc").path).toBe("/membros/:id");
    });

    it("mantém só os parâmetros de campanha", () => {
        const { url } = cleanUrl("https://x.app/recursos?utm_source=instagram&email=a@b.com&token=1&gclid=9");
        expect(url).toBe("https://x.app/recursos?utm_source=instagram&gclid=9");
    });

    it("nenhum track() do site manda nome, e-mail, telefone ou valor", () => {
        const root = path.resolve(__dirname, "../..");
        const files: string[] = [];
        const walk = (d: string) => {
            for (const n of readdirSync(d)) {
                if (n === "node_modules" || n.startsWith(".")) continue;
                const f = path.join(d, n);
                if (statSync(f).isDirectory()) walk(f);
                else if (/\.tsx?$/.test(n)) files.push(f);
            }
        };
        ["app", "components", "lib"].forEach((d) => walk(path.join(root, d)));
        const calls = files.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/\btrack\(\s*([^;]*?)\);/g)].map((m) => m[1]));
        expect(calls.length).toBeGreaterThan(8);
        const forbidden = /\b(name|nome|email|phone|telefone|amount|valor|price|document|cpf|cnpj)\b\s*:/i;
        expect(calls.filter((c) => forbidden.test(c))).toEqual([]);
    });
});
