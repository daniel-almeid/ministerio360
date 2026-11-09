// Programa de indicação no site: código guardado no navegador entre a página inicial e o cadastro
export const REFERRAL_STORAGE_KEY = "m360_indicacao";

// "k7m-2qx " -> "K7M2QX"
export function cleanReferralCode(value: unknown) {
    return typeof value === "string" ? value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) : "";
}

export function saveReferralCode(code: string) {
    const clean = cleanReferralCode(code);
    if (!clean) return;
    try {
        localStorage.setItem(REFERRAL_STORAGE_KEY, clean);
    } catch {
        // navegador sem armazenamento: o código pode ser digitado no cadastro
    }
}

export function readReferralCode() {
    try {
        return cleanReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY));
    } catch {
        return "";
    }
}

export function clearReferralCode() {
    try {
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
    } catch {}
}

// Link para mandar a outro pastor
export function referralLink(origin: string, code: string) {
    return `${origin}/?indicacao=${encodeURIComponent(code)}`;
}

export function referralMessage(origin: string, code: string) {
    return [
        "Estou usando o Ministério360 para organizar a igreja: membros, finanças, escalas e visitantes, no celular e no computador.",
        "",
        `Crie a conta da sua igreja por este link (o código ${code} já vai preenchido):`,
        referralLink(origin, code),
    ].join("\n");
}
