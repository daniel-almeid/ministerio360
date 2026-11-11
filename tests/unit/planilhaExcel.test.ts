import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { readTable } from "@/app/(protected)/membros/import/spreadsheet";

describe("Importar planilha do Excel no site", () => {
    it("lê a primeira aba com conteúdo de um .xlsx", async () => {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([]), "Vazia");
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet([
                ["Nome", "Telefone"],
                ["Maria da Silva", "(11) 98888-1020"],
            ]),
            "Membros"
        );
        const bytes = new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));

        const table = await readTable("membros.xlsx", bytes);
        expect(table[0]).toEqual(["Nome", "Telefone"]);
        expect(table[1]).toEqual(["Maria da Silva", "(11) 98888-1020"]);
    });

    it("CSV continua sendo lido sem a biblioteca do Excel", async () => {
        const bytes = new TextEncoder().encode("Nome;Telefone\r\nJoão;11999990000\r\n");
        expect(await readTable("membros.csv", bytes)).toEqual([
            ["Nome", "Telefone"],
            ["João", "11999990000"],
        ]);
    });
});
