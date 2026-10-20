// "1234.5" -> "R$ 1.234,50" (sem depender do Intl do aparelho)
export function formatBRL(value: number) {
    const negative = value < 0;
    const [int, dec] = Math.abs(value).toFixed(2).split(".");
    const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${negative ? "-" : ""}R$ ${withDots},${dec}`;
}

// Aceita "1.234,56", "1234,56", "1234.56", "R$ 50" -> número (ou NaN)
export function parseAmount(text: string) {
    const clean = String(text ?? "").replace(/[R$\s]/g, "");
    if (!clean) return NaN;
    const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
    return Number(normalized);
}

// 1234.5 -> "1234,50" (para preencher um campo de valor)
export function amountToInput(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) return "";
    return value.toFixed(2).replace(".", ",");
}
