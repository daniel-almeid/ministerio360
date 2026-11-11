import { describe, expect, it } from "vitest";
import {
    ImportError,
    buildImportPreview,
    normalizeKey,
    parseBirthDate,
    stripAccents,
    tidyName,
    tidyPhone,
} from "@/app/(protected)/membros/import/memberImportParser";
import { MAX_ROWS, decodeText, detectDelimiter, fileKind, parseCsv } from "@/app/(protected)/membros/import/spreadsheet";

const hoje = new Date(2026, 9, 21);

describe("Leitura do arquivo", () => {
    it("CSV do Excel brasileiro (;) com aspas e quebra de linha", () => {
        const text = 'Nome;Telefone\r\n"Silva; João";11999998888\r\n"Ana ""Aninha""";\n"Linha\nquebrada";1';
        expect(detectDelimiter(text)).toBe(";");
        expect(parseCsv(text)).toEqual([
            ["Nome", "Telefone"],
            ["Silva; João", "11999998888"],
            ['Ana "Aninha"', ""],
            ["Linha\nquebrada", "1"],
        ]);
    });

    it("descobre o separador", () => {
        expect(detectDelimiter("nome,telefone\nAna,1")).toBe(",");
        expect(detectDelimiter("nome\ttelefone")).toBe("\t");
        expect(detectDelimiter("só uma coluna")).toBe(";");
        expect(detectDelimiter('"a,b";c')).toBe(";");
    });

    it("acentos: UTF-8 com BOM e ANSI (Windows-1252)", () => {
        const utf8 = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode("João")]);
        expect(decodeText(utf8)).toBe("João");
        const ansi = new Uint8Array([0x4a, 0x6f, 0xe3, 0x6f, 0x20, 0x80]); // "João €" em Windows-1252
        expect(decodeText(ansi)).toBe("João €");
    });

    it("tipo do arquivo pela extensão ou pelo conteúdo", () => {
        expect(fileKind("membros.CSV", new Uint8Array())).toBe("csv");
        expect(fileKind("membros.xlsx", new Uint8Array())).toBe("excel");
        expect(fileKind("arquivo", new Uint8Array([0x50, 0x4b]))).toBe("excel");
        expect(fileKind("arquivo", new Uint8Array([0xd0, 0xcf]))).toBe("excel");
        expect(fileKind("arquivo", new Uint8Array([0x41]))).toBe("csv");
    });
});

describe("Limpeza dos campos", () => {
    it("nomes", () => {
        expect(tidyName("MARIA DA SILVA")).toBe("Maria da Silva");
        expect(tidyName("joão  dos   santos")).toBe("João dos Santos");
        expect(tidyName("McDonald Silva")).toBe("McDonald Silva");
        expect(tidyName("   ")).toBe("");
    });

    it("telefones", () => {
        expect(tidyPhone("11999998888")).toBe("(11) 99999-8888");
        expect(tidyPhone(11999998888)).toBe("(11) 99999-8888");
        expect(tidyPhone("+55 (11) 3456-7890")).toBe("(11) 3456-7890");
        expect(tidyPhone("+1 415 555 0101")).toBe("+1 415 555 0101");
        expect(tidyPhone("ramal 20")).toBe("ramal 20");
        expect(tidyPhone(null)).toBeNull();
    });

    it("datas de nascimento em vários formatos", () => {
        expect(parseBirthDate("14/03/1992", hoje)).toBe("1992-03-14");
        expect(parseBirthDate("14/3/92", hoje)).toBe("1992-03-14");
        expect(parseBirthDate("01/01/10", hoje)).toBe("2010-01-01");
        expect(parseBirthDate("14-03-1992", hoje)).toBe("1992-03-14");
        expect(parseBirthDate("14.03.1992", hoje)).toBe("1992-03-14");
        expect(parseBirthDate("1992-03-14", hoje)).toBe("1992-03-14");
        expect(parseBirthDate(33677, hoje)).toBe("1992-03-14"); // célula de data do Excel
        expect(parseBirthDate("31/02/1992", hoje)).toBe("invalid");
        expect(parseBirthDate("01/01/2030", hoje)).toBe("invalid");
        expect(parseBirthDate("ontem", hoje)).toBe("invalid");
        expect(parseBirthDate("", hoje)).toBeNull();
        expect(parseBirthDate(null, hoje)).toBeNull();
    });

    it("comparação sem acento", () => {
        expect(stripAccents("Ação Çé")).toBe("acao ce");
        expect(normalizeKey("Data de Nascimento")).toBe("datadenascimento");
        expect(normalizeKey(" E-mail ")).toBe("email");
    });
});

describe("Prévia da importação", () => {
    const ministerios = [{ id: "m-louvor", name: "Louvor" }];

    it("acha os títulos mesmo abaixo de uma linha de título e reconhece apelidos de coluna", () => {
        const tabela = [
            ["Lista de membros 2026"],
            ["Nome completo", "Celular", "E-mail", "Nascimento", "Departamento", "Situação", "Observação"],
            ["ANA SOUZA", "11999998888", "ANA@X.COM", "14/03/1992", "louvor", "Ativo", "x"],
        ];
        const p = buildImportPreview("membros.xlsx", tabela, [], ministerios, hoje);
        expect(p.columns).toEqual({
            name: "Nome completo",
            phone: "Celular",
            email: "E-mail",
            birth_date: "Nascimento",
            ministry: "Departamento",
            status: "Situação",
        });
        expect(p.ignoredColumns).toEqual(["Observação"]);
        expect(p.rows[0].line).toBe(3);
        expect(p.rows[0].status).toBe("ok");
        expect(p.rows[0].data).toEqual({
            name: "Ana Souza",
            phone: "(11) 99999-8888",
            email: "ana@x.com",
            birth_date: "1992-03-14",
            ministry_id: "m-louvor",
            ministry_name: "Louvor",
            is_active: true,
        });
    });

    it("avisa dados inválidos, recusa sem nome e duplicados", () => {
        const tabela = [
            ["Nome", "Email", "Data de nascimento", "Status"],
            ["Bruno", "email-ruim", "31/02/1990", "inativo"],
            ["", "x@y.com", "", ""],
            ["José da Silva", "", "", ""],
            ["Carla", "", "", ""],
            ["CARLA", "", "", ""],
            ["", "", "", ""],
        ];
        const p = buildImportPreview("membros.csv", tabela, ["Jose da Silva"], [], hoje);
        const porNome = Object.fromEntries(p.rows.map((r) => [r.data.name || "(vazio)", r]));

        expect(porNome["Bruno"].status).toBe("warning");
        expect(porNome["Bruno"].data.email).toBeNull();
        expect(porNome["Bruno"].data.birth_date).toBeNull();
        expect(porNome["Bruno"].data.is_active).toBe(false);
        expect(porNome["Bruno"].issues).toHaveLength(2);
        expect(porNome["(vazio)"].status).toBe("error");
        expect(porNome["José da Silva"].status).toBe("duplicate"); // já existe (sem acento conta igual)
        expect(p.rows.filter((r) => r.data.name === "Carla").map((r) => r.status)).toEqual(["ok", "duplicate"]);
        expect(p.rows).toHaveLength(5); // a linha em branco é ignorada
        expect(p.counts).toEqual({ ok: 1, warning: 1, duplicate: 2, error: 1 });
    });

    it("cria ministério novo uma vez só, preferindo a grafia com acento", () => {
        const tabela = [
            ["Nome", "Ministério"],
            ["Ana", "intercessao"],
            ["Bia", "INTERCESSÃO"],
            ["Caio", "Louvor"],
            ["", "Recepção"], // linha sem nome: não cria o ministério
        ];
        const p = buildImportPreview("m.csv", tabela, [], ministerios, hoje);
        expect(p.newMinistries).toEqual(["Intercessão"]);
        expect(p.rows.filter((r) => r.data.name !== "").map((r) => r.data.ministry_name)).toEqual([
            "Intercessão",
            "Intercessão",
            "Louvor",
        ]);
    });

    it("erros que impedem a importação", () => {
        expect(() => buildImportPreview("x.csv", [["Telefone"], ["1"]], [], [], hoje)).toThrow(ImportError);
        expect(() => buildImportPreview("x.csv", [["Nome"], ["", ""]], [], [], hoje)).toThrow(/nenhum membro/);
        const grande = [["Nome"], ...Array.from({ length: MAX_ROWS + 1 }, (_, i) => [`Pessoa ${i}`])];
        expect(() => buildImportPreview("x.csv", grande, [], [], hoje)).toThrow(/no máximo/);
    });
});
