// Valor em reais por extenso, como vai no recibo: 1250.5 -> "mil duzentos e cinquenta reais e cinquenta centavos"

const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZ_A_DEZENOVE = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

// 0 a 999
function ate999(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cem";

    const c = Math.floor(n / 100);
    const resto = n % 100;
    const partes: string[] = [];
    if (c) partes.push(CENTENAS[c]);

    if (resto >= 10 && resto < 20) partes.push(DEZ_A_DEZENOVE[resto - 10]);
    else {
        const d = Math.floor(resto / 10);
        const u = resto % 10;
        if (d) partes.push(DEZENAS[d]);
        if (u) partes.push(UNIDADES[u]);
    }
    return partes.join(" e ");
}

const GRUPOS: [string, string][] = [
    ["", ""],
    ["mil", "mil"],
    ["milhão", "milhões"],
    ["bilhão", "bilhões"],
];

// Número inteiro por extenso (até 999 bilhões)
export function inteiroPorExtenso(n: number): string {
    n = Math.floor(Math.abs(n));
    if (n === 0) return "zero";

    const grupos: number[] = [];
    while (n > 0) {
        grupos.push(n % 1000);
        n = Math.floor(n / 1000);
    }

    const partes: { texto: string; valor: number }[] = [];
    for (let i = grupos.length - 1; i >= 0; i--) {
        const g = grupos[i];
        if (!g) continue;
        let texto: string;
        if (i === 1) texto = g === 1 ? "mil" : `${ate999(g)} mil`;
        else if (i > 1) texto = `${ate999(g)} ${g === 1 ? GRUPOS[i][0] : GRUPOS[i][1]}`;
        else texto = ate999(g);
        partes.push({ texto, valor: g });
    }

    // "e" antes do último grupo quando ele é menor que 100 ou é centena redonda (mil e cem, mil e vinte)
    return partes
        .map((p, idx) => {
            if (idx === 0) return p.texto;
            const ultimo = idx === partes.length - 1;
            const usaE = ultimo && (p.valor < 100 || p.valor % 100 === 0);
            return (usaE ? " e " : " ") + p.texto;
        })
        .join("");
}

export function reaisPorExtenso(valor: number): string {
    const totalCentavos = Math.round(Math.abs(valor) * 100);
    const reais = Math.floor(totalCentavos / 100);
    const centavos = totalCentavos % 100;

    const partes: string[] = [];
    if (reais > 0) {
        const texto = inteiroPorExtenso(reais);
        // "um milhão de reais", "dois milhões de reais"
        const de = /(ão|ões)$/.test(texto) ? " de" : "";
        partes.push(`${texto}${de} ${reais === 1 ? "real" : "reais"}`);
    }
    if (centavos > 0) partes.push(`${inteiroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`);
    if (!partes.length) return "zero real";
    return partes.join(" e ");
}
