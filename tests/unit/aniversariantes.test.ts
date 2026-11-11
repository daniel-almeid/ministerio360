import { describe, expect, it } from "vitest";
import {
    ageInYear,
    birthdayDayIn,
    buildMonthEntries,
    describeEntry,
    firstName,
    initials,
    isLeapYear,
    joinNames,
    monthLabel,
    nextBirthday,
    parseBirthDate,
    shiftMonth,
} from "@/app/(protected)/dashboard/birthdays/birthdays";
import { birthdayMessage } from "@/app/(protected)/dashboard/birthdays/constants";

const hoje = new Date(2026, 9, 21, 9, 0); // 21/10/2026

describe("Aniversariantes", () => {
    it("lê a data sem erro de fuso", () => {
        expect(parseBirthDate("1992-03-14")).toEqual({ year: 1992, month: 3, day: 14 });
        expect(parseBirthDate("1992-03-14T00:00:00Z")).toEqual({ year: 1992, month: 3, day: 14 });
        expect(parseBirthDate("1992-13-01")).toBeNull();
        expect(parseBirthDate("")).toBeNull();
        expect(parseBirthDate(null)).toBeNull();
    });

    it("29/02 vira 28/02 em ano que não é bissexto", () => {
        expect(isLeapYear(2028)).toBe(true);
        expect(isLeapYear(2100)).toBe(false);
        expect(isLeapYear(2000)).toBe(true);
        expect(birthdayDayIn(2, 29, 2026)).toBe(28);
        expect(birthdayDayIn(2, 29, 2028)).toBe(29);
    });

    it("idade ignora anos inválidos", () => {
        expect(ageInYear(1990, 2026)).toBe(36);
        expect(ageInYear(1, 2026)).toBeNull();
        expect(ageInYear(2030, 2026)).toBeNull();
    });

    it("lista do mês em ordem, com situação em relação a hoje", () => {
        const membros = [
            { id: "1", name: "Zeca", phone: null, birthDate: "1980-10-22" },
            { id: "2", name: "Ana", phone: null, birthDate: "1990-10-21" },
            { id: "3", name: "Bia", phone: null, birthDate: "2000-10-05" },
            { id: "4", name: "Caio", phone: null, birthDate: "1995-10-30" },
            { id: "5", name: "Outro mês", phone: null, birthDate: "1995-11-01" },
        ];
        const lista = buildMonthEntries(membros, { year: 2026, month: 10 }, hoje);
        expect(lista.map((e) => `${e.name}:${e.status}:${e.age}`)).toEqual([
            "Bia:past:26",
            "Ana:today:36",
            "Zeca:tomorrow:46",
            "Caio:upcoming:31",
        ]);
        expect(describeEntry(lista[1])).toBe("Hoje · 36 anos");
        expect(describeEntry(lista[2])).toBe("Amanhã · faz 46 anos");
        expect(describeEntry(lista[0])).toBe("Dia 5 · fez 26 anos");
        expect(describeEntry(lista[3])).toBe("Dia 30 · faz 31 anos");
    });

    it("próximo aniversário passa para o ano seguinte quando já passou", () => {
        expect(nextBirthday("1990-10-21", hoje)?.date.getFullYear()).toBe(2026);
        const proximo = nextBirthday("1990-01-10", hoje);
        expect(proximo?.date.getFullYear()).toBe(2027);
        expect(proximo?.age).toBe(37);
        expect(nextBirthday("lixo", hoje)).toBeNull();
    });

    it("navegação entre meses e títulos", () => {
        expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
        expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
        expect(monthLabel({ year: 2026, month: 10 }, hoje)).toBe("outubro");
        expect(monthLabel({ year: 2027, month: 1 }, hoje)).toBe("janeiro de 2027");
    });

    it("nomes", () => {
        expect(firstName("JOÃO pedro")).toBe("João");
        expect(firstName("   ")).toBe("irmão(ã)");
        expect(initials("Maria da Silva")).toBe("MS");
        expect(initials("Ana")).toBe("A");
        expect(initials("")).toBe("?");
        expect(joinNames(["Ana", "Pedro", "Júlia"])).toBe("Ana, Pedro e Júlia");
        expect(joinNames([])).toBe("");
    });

    it("mensagem de parabéns usa o nome da igreja só quando é real", () => {
        expect(birthdayMessage("Ana", "Igreja Central")).toContain("Toda a família da Igreja Central");
        expect(birthdayMessage("Ana", "Carregando...")).toContain("Sua família na fé");
        expect(birthdayMessage("Ana", null)).toMatch(/^Feliz aniversário, Ana!/);
    });
});
